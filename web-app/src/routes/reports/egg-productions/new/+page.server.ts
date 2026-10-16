import { eggProductionCreateSchema } from '#lib/schemas/eggProduction.ts';
import { fail, redirect } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.ts';
import { batches, eggProduction } from '#lib/server/db/schema.ts';
import { formatLongDate } from '#lib/utils/dates.ts';

export const load: PageServerLoad = async () => {
	const batchList = await db
		.select({ id: batches.id, name: batches.name })
		.from(batches)
		.orderBy(asc(batches.name));
	return { batches: batchList };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const raw = Object.fromEntries(await request.formData());
		const parsed = eggProductionCreateSchema.safeParse(raw);

		if (!parsed.success) {
			return fail(400, {
				values: raw,
				errors: parsed.error.flatten().fieldErrors
			});
		}

		const d = parsed.data;

		// ── Pre-check 1: batch exists and has arrived by productionDate ──
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

		// ── Pre-check 2: no existing entry for this batch+date ──
		const [existing] = await db
			.select({ id: eggProduction.id })
			.from(eggProduction)
			.where(
				and(
					eq(eggProduction.batchId, d.batchId),
					eq(eggProduction.productionDate, d.productionDate)
				)
			)
			.limit(1);

		if (existing) {
			return fail(400, {
				values: raw,
				errors: {
					productionDate: [`This batch already has an entry for that date.`]
				},
				existingId: existing.id
			});
		}

		// ── Insert ──
		try {
			await db.insert(eggProduction).values({
				batchId: d.batchId,
				productionDate: d.productionDate,
				eggsCollected: d.eggsCollected,
				eggsBroken: d.eggsBroken,
				eggsDiscarded: d.eggsDiscarded,
				totalWeightKg: d.totalWeightKg?.toString() ?? null,
				notes: d.notes ?? null,
				source: d.source
			});
		} catch (e: unknown) {
			const err = e as { code?: string; constraint?: string; message?: string };
			if (
				err?.code === '23505' ||
				err?.constraint === 'egg_batch_date_unique' ||
				(err?.message ?? '').includes('egg_batch_date_unique')
			) {
				return fail(400, {
					values: raw,
					errors: {
						productionDate: ['This batch already has an entry for that date.']
					}
				});
			}
			console.error('[egg-production create] insert failed:', e);
			throw e;
		}

		redirect(303, '/reports/egg-productions');
	}
};
