import { eggProductionUpdateSchema } from '#lib/schemas/eggProduction.ts';
import { eq, asc } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getEggProductionById } from '#lib/server/db/queries/eggProduction.ts';
import { db } from '#lib/server/db/index.ts';
import { batches, eggProduction } from '#lib/server/db/schema.ts';
import { redirect } from '@sveltejs/kit';
import { success } from 'zod';

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
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			if (msg.includes('egg_batch_date_unique')) {
				return fail(400, {
					values: raw,
					errors: { productionDate: ['This batch already has an entry for that date.'] }
				});
			}
			throw e;
		}

        redirect(303, `/reports/egg-productions`);
        return {success: true};
	}
};
