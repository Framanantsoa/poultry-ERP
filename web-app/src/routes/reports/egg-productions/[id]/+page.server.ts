import { eggProductionUpdateSchema } from '#lib/schemas/eggProduction.ts';
import { and, asc, eq, ne } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getEggProductionById } from '#lib/server/db/queries/eggProduction.ts';
import { db } from '#lib/server/db/index.ts';
import { batches, eggProduction } from '#lib/server/db/schema.ts';
import { formatLongDate } from '#lib/utils/dates.ts';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) throw error(404, 'Not found');

	const row = await getEggProductionById(id);
	if (!row) throw error(404, 'Egg production not found');

	const batchList = await db
		.select({ id: batches.id, name: batches.name })
		.from(batches)
		.orderBy(asc(batches.name));

	return { row, batches: batchList };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		if (!Number.isInteger(id) || id <= 0) throw error(404, 'Not found');

		const raw = Object.fromEntries(await request.formData());
		const parsed = eggProductionUpdateSchema.safeParse(raw);

		if (!parsed.success) {
			return fail(400, {
				values: raw,
				errors: parsed.error.flatten().fieldErrors
			});
		}

		const d = parsed.data;

		// ── Pre-check: batch exists and has arrived by productionDate ──
		const [batch] = await db
			.select({
				id: batches.id,
				name: batches.name,
				arrivalDate: batches.arrivalDate
			})
			.from(batches)
			.where(eq(batches.id, d.batchId))
			.limit(1);

		if (!batch) {
			return fail(400, {
				values: raw,
				errors: { batchId: ['Selected batch does not exist.'] }
			});
		}

		if (batch.arrivalDate && d.productionDate < batch.arrivalDate) {
			return fail(400, {
				values: raw,
				errors: {
					productionDate: [
						`Production cannot be recorded before ${formatLongDate(batch.arrivalDate)}.`
					]
				}
			});
		}

		// ── Update ──
		try {
			await db
				.update(eggProduction)
				.set({
					batchId: d.batchId,
					productionDate: d.productionDate,
					eggsCollected: d.eggsCollected,
					eggsBroken: d.eggsBroken,
					eggsDiscarded: d.eggsDiscarded,
					totalWeightKg: d.totalWeightKg?.toString() ?? null,
					notes: d.notes ?? null,
					updatedAt: new Date()
				})
				.where(eq(eggProduction.id, id));
		} catch (e: unknown) {
			// Defensive: race condition between check and update
			const err = e as { code?: string; constraint?: string; message?: string };
			if (
				err?.code === '23505' ||
				err?.constraint === 'egg_batch_date_unique' ||
				(err?.message ?? '').includes('egg_batch_date_unique')
			) {
				return fail(400, {
					values: raw,
					errors: { productionDate: ['Another entry already exists for this batch and date.'] }
				});
			}
			console.error('[egg-production update] failed:', e);
			throw e;
		}

		redirect(303, '/reports/egg-productions');
	}
};
