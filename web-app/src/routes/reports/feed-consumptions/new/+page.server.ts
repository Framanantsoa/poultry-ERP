import { feedConsumptionCreateSchema } from '#lib/schemas/feedConsumption.ts';
import { fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.ts';
import { batches, feedConsumption } from '#lib/server/db/schema.ts';
import {
	findConflictingFeedEntry,
	getBatchForFeedGuard
} from '#lib/server/db/queries/feedConsumption.ts';
import { formatLongDate } from '#lib/utils/dates.ts';

// Batch statuses that are allowed to receive feed entries
const ACTIVE_STATUSES = ['active'] as const;

export const load: PageServerLoad = async () => {
	// Only show active batches in the picker — completed/archived can't receive feed
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
		const parsed = feedConsumptionCreateSchema.safeParse(raw);

		if (!parsed.success) {
			return fail(400, {
				values: raw,
				errors: parsed.error.flatten().fieldErrors
			});
		}

		const d = parsed.data;

		// ── Pre-check 1: batch exists + is active + arrival date guard ──
		const batch = await getBatchForFeedGuard(d.batchId);

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
						`Batch "${batch.name}" is ${batch.status}. Only active batches can receive feed.`
					]
				}
			});
		}

		if (batch.arrivalDate && d.consumptionDate < batch.arrivalDate) {
			return fail(400, {
				values: raw,
				errors: {
					consumptionDate: [
						`Must be on or after the batch's arrival (${formatLongDate(batch.arrivalDate)}).`
					]
				}
			});
		}

		// ── Pre-check 2: unique per batch + day ──
		const conflictId = await findConflictingFeedEntry(d.batchId, d.consumptionDate);

		if (conflictId) {
			return fail(400, {
				values: raw,
				errors: {
					consumptionDate: ['This batch already has a feed entry for that date.']
				},
				existingId: conflictId
			});
		}

		// ── Insert ──
		try {
			await db.insert(feedConsumption).values({
				batchId: d.batchId,
				consumptionDate: d.consumptionDate,
				quantityKg: d.quantityKg.toString(),
				feedType: d.feedType ?? null,
				costPerKg: d.costPerKg != null ? d.costPerKg.toString() : null,
				notes: d.notes ?? null,
				source: d.source
			});
		} catch (e: unknown) {
			const err = e as { code?: string; constraint?: string; message?: string };
			if (
				err?.code === '23505' ||
				err?.constraint === 'feed_batch_date_unique' ||
				(err?.message ?? '').includes('feed_batch_date_unique')
			) {
				return fail(400, {
					values: raw,
					errors: {
						consumptionDate: ['This batch already has a feed entry for that date.']
					}
				});
			}
			console.error('[feed-consumption create] insert failed:', e);
			throw e;
		}

		redirect(303, '/reports/feed-consumptions');
	}
};
