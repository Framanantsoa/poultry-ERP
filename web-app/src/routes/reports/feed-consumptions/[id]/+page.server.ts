import { feedConsumptionUpdateSchema } from '#lib/schemas/feedConsumption.ts';
import { asc, eq, ne } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getFeedConsumptionById } from '#lib/server/db/queries/feedConsumption.ts';
import { db } from '#lib/server/db/index.ts';
import { batches, feedConsumption } from '#lib/server/db/schema.ts';
import { formatLongDate } from '#lib/utils/dates.ts';
import { and } from 'drizzle-orm';

// Batch statuses allowed to receive feed
const ACTIVE_STATUSES = ['active'] as const;

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) throw error(404, 'Not found');

	const row = await getFeedConsumptionById(id);
	if (!row) throw error(404, 'Feed consumption not found');

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
		const parsed = feedConsumptionUpdateSchema.safeParse(raw);

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
				status: batches.status
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

		// ── Pre-check 2: no OTHER entry for this batch+date ──
		// Exclude the current row so editing in place doesn't conflict with itself
		const [conflict] = await db
			.select({ id: feedConsumption.id })
			.from(feedConsumption)
			.where(
				and(
					eq(feedConsumption.batchId, d.batchId),
					eq(feedConsumption.consumptionDate, d.consumptionDate),
					ne(feedConsumption.id, id)
				)
			)
			.limit(1);

		if (conflict) {
			return fail(400, {
				values: raw,
				errors: {
					consumptionDate: ['Another entry already exists for this batch and date.']
				},
				existingId: conflict.id
			});
		}

		// ── Update ──
		try {
			await db
				.update(feedConsumption)
				.set({
					batchId: d.batchId,
					consumptionDate: d.consumptionDate,
					quantityKg: d.quantityKg.toString(),
					feedType: d.feedType ?? null,
					costPerKg: d.costPerKg != null ? d.costPerKg.toString() : null,
					notes: d.notes ?? null,
					updatedAt: new Date()
				})
				.where(eq(feedConsumption.id, id));
		} catch (e: unknown) {
			// Defensive: race between check and update
			const err = e as { code?: string; constraint?: string; message?: string };
			if (
				err?.code === '23505' ||
				err?.constraint === 'feed_batch_date_unique' ||
				(err?.message ?? '').includes('feed_batch_date_unique')
			) {
				return fail(400, {
					values: raw,
					errors: {
						consumptionDate: ['Another entry already exists for this batch and date.']
					}
				});
			}
			console.error('[feed-consumption update] failed:', e);
			throw e;
		}

		redirect(303, '/reports/feed-consumptions');
	}
};
