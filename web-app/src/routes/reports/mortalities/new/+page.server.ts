import { mortalityCreateSchema } from '#lib/schemas/mortality.ts';
import { and, asc, eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.ts';
import { batches, mortality } from '#lib/server/db/schema.ts';
import { getBatchForMortalityGuard } from '#lib/server/db/queries/mortality.ts';

// Batch statuses allowed to receive mortality entries
const ACTIVE_STATUSES = ['active'] as const;

export const load: PageServerLoad = async () => {
	// Only show active batches in the picker
	const batchList = await db
		.select({ id: batches.id, name: batches.name })
		.from(batches)
		.where(eq(batches.status, 'active'))
		.orderBy(asc(batches.name));

	return { batches: batchList };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const raw = Object.fromEntries(await request.formData());
		const parsed = mortalityCreateSchema.safeParse(raw);

		if (!parsed.success) {
			return fail(400, {
				values: raw,
				errors: parsed.error.flatten().fieldErrors
			});
		}

		const d = parsed.data;

		// ── Pre-check 1: batch exists + active + arrival date ──
		const batch = await getBatchForMortalityGuard(d.batchId);

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

		// ── Pre-check 2: one mortality entry per batch per day ──
		const [existing] = await db
			.select({ id: mortality.id })
			.from(mortality)
			.where(
				and(
					eq(mortality.batchId, d.batchId),
					eq(mortality.eventDate, d.eventDate)
				)
			)
			.limit(1);

		if (existing) {
			return fail(400, {
				values: raw,
				errors: {
					eventDate: ['This batch already has a mortality entry for that date.']
				},
				existingId: existing.id
			});
		}

		// ── Pre-check 3: deaths don't exceed current bird count ──
		if (d.deaths > batch.currentCount) {
			return fail(400, {
				values: raw,
				errors: {
					deaths: [
						`Only ${batch.currentCount} ${batch.currentCount === 1 ? 'bird' : 'birds'} remain in this batch.`
					]
				}
			});
		}

		// ── Insert ──
		try {
			await db.insert(mortality).values({
				batchId: d.batchId,
				eventDate: d.eventDate,
				deaths: d.deaths,
				cause: d.cause ?? null,
				notes: d.notes ?? null,
				source: d.source
			});
		} catch (e: unknown) {
			// Defensive: race condition between check and insert
			const err = e as { code?: string; constraint?: string; message?: string };
			if (
				err?.code === '23505' ||
				err?.constraint === 'mortality_batch_date_unique' ||
				(err?.message ?? '').includes('mortality_batch_date_unique')
			) {
				return fail(400, {
					values: raw,
					errors: {
						eventDate: ['This batch already has a mortality entry for that date.']
					}
				});
			}
			console.error('[mortality create] insert failed:', e);
			throw e;
		}

		redirect(303, '/reports/mortalities');
	}
};
