import { mortalityUpdateSchema } from '#lib/schemas/mortality.ts';
import { and, asc, eq, ne, sql } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getMortalityById } from '#lib/server/db/queries/mortality.ts';
import { db } from '#lib/server/db/index.ts';
import { batches, mortality } from '#lib/server/db/schema.ts';

// Batch statuses allowed to receive mortality entries
const ACTIVE_STATUSES = ['active'] as const;

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) throw error(404, 'Not found');

	const row = await getMortalityById(id);
	if (!row) throw error(404, 'Mortality record not found');

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
		const parsed = mortalityUpdateSchema.safeParse(raw);

		if (!parsed.success) {
			return fail(400, {
				values: raw,
				errors: parsed.error.flatten().fieldErrors
			});
		}

		const d = parsed.data;

		// ── Pre-check 1: batch exists, is active, and has arrived ──
		const [batch] = await db
			.select({
				id: batches.id,
				name: batches.name,
				arrivalDate: batches.arrivalDate,
				status: batches.status,
				initialCount: batches.initialCount,
				currentCount: batches.currentCount
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

		if (!ACTIVE_STATUSES.includes(batch.status as (typeof ACTIVE_STATUSES)[number])) {
			return fail(400, {
				values: raw,
				errors: {
					batchId: [
						`Batch "${batch.name}" is ${batch.status}. Only active batches can record mortalities.`
					]
				}
			});
		}

		if (batch.arrivalDate && d.eventDate < batch.arrivalDate) {
			return fail(400, {
				values: raw,
				errors: {
					eventDate: [
						`Must be on or after the batch's arrival (${batch.arrivalDate}).`
					]
				}
			});
		}

		// ── Pre-check 2: new deaths don't exceed available birds ──
		// When editing, the batch's current_count already excludes THIS row's deaths
		// (because the trigger recomputed after insert). So the constraint is:
		//   newDeaths <= current_count
		//
		// But if the user changed the batch, we need the OLD batch's count too.
		// Simplest safe rule: newDeaths must be <= initial_count - (all OTHER deaths for this batch)
		// We compute it directly to avoid ordering surprises.
		const [row] = await db
			.select({ batchId: mortality.batchId })
			.from(mortality)
			.where(eq(mortality.id, id))
			.limit(1);

		if (!row) throw error(404, 'Mortality record not found');

		// Sum of all OTHER deaths for the target batch
		const [sumRow] = await db
			.select({
				total: sql<number>`coalesce(sum(${mortality.deaths}), 0)::int`
			})
			.from(mortality)
			.where(and(eq(mortality.batchId, d.batchId), ne(mortality.id, id)));

		const otherDeaths = sumRow?.total ?? 0;
		const availableBirds = batch.initialCount - otherDeaths;

		if (d.deaths > availableBirds) {
			return fail(400, {
				values: raw,
				errors: {
					deaths: [
						`Only ${availableBirds} ${availableBirds === 1 ? 'bird' : 'birds'} available for this batch.`
					]
				}
			});
		}

		// ── Update ──
		try {
			await db
				.update(mortality)
				.set({
					batchId: d.batchId,
					eventDate: d.eventDate,
					deaths: d.deaths,
					cause: d.cause ?? null,
					notes: d.notes ?? null,
					updatedAt: new Date()
				})
				.where(eq(mortality.id, id));
		} catch (e: unknown) {
			console.error('[mortality update] failed:', e);
			throw e;
		}

		redirect(303, '/reports/mortalities');
	}
};