import { and, desc, eq, gte, lte, sql, count } from 'drizzle-orm';
import type { FeedConsumptionListFilters } from '#lib/schemas/feedConsumption.ts';
import { batches, feedConsumption } from '../schema';
import { db } from '..';

export type FeedConsumptionListItem = {
	id: number;
	batchId: number;
	batchName: string | null;
	consumptionDate: string;
	quantityKg: string; // numeric → string in Drizzle
	feedType: string | null;
	costPerKg: string | null;
	createdAt: Date;
};

export type PaginatedResult<T> = {
	rows: T[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
};

// ─── Paginated list ─────────────────────────────────────────────────
export async function listFeedConsumptions(
	filters: FeedConsumptionListFilters
): Promise<PaginatedResult<FeedConsumptionListItem>> {
	const { page, perPage, batchId, from, to } = filters;

	const conditions = [];
	if (batchId) conditions.push(eq(feedConsumption.batchId, batchId));
	if (from) conditions.push(gte(feedConsumption.consumptionDate, from));
	if (to) conditions.push(lte(feedConsumption.consumptionDate, to));

	const where = conditions.length ? and(...conditions) : undefined;

	const [rows, [{ value: total }]] = await Promise.all([
		db
			.select({
				id: feedConsumption.id,
				batchId: feedConsumption.batchId,
				batchName: batches.name,
				consumptionDate: feedConsumption.consumptionDate,
				quantityKg: feedConsumption.quantityKg,
				feedType: feedConsumption.feedType,
				costPerKg: feedConsumption.costPerKg,
				createdAt: feedConsumption.createdAt
			})
			.from(feedConsumption)
			.leftJoin(batches, eq(feedConsumption.batchId, batches.id))
			.where(where)
			.orderBy(
				desc(feedConsumption.consumptionDate),
				desc(feedConsumption.id)
			)
			.limit(perPage)
			.offset((page - 1) * perPage),

		db
			.select({ value: count() })
			.from(feedConsumption)
			.where(where)
	]);

	return {
		rows,
		total,
		page,
		perPage,
		totalPages: Math.max(1, Math.ceil(total / perPage))
	};
}

// ─── Single row (detail page) ───────────────────────────────────────
export async function getFeedConsumptionById(id: number) {
	const [row] = await db
		.select({
			id: feedConsumption.id,
			batchId: feedConsumption.batchId,
			batchName: batches.name,
			consumptionDate: feedConsumption.consumptionDate,
			quantityKg: feedConsumption.quantityKg,
			feedType: feedConsumption.feedType,
			costPerKg: feedConsumption.costPerKg,
			notes: feedConsumption.notes,
			source: feedConsumption.source,
			createdAt: feedConsumption.createdAt,
			updatedAt: feedConsumption.updatedAt
		})
		.from(feedConsumption)
		.leftJoin(batches, eq(feedConsumption.batchId, batches.id))
		.where(eq(feedConsumption.id, id));

	return row ?? null;
}

// ─── Aggregate totals (for KPI cards) ───────────────────────────────
export async function getFeedConsumptionTotals(
	filters: FeedConsumptionListFilters
) {
	const conditions = [];
	if (filters.batchId) conditions.push(eq(feedConsumption.batchId, filters.batchId));
	if (filters.from) conditions.push(gte(feedConsumption.consumptionDate, filters.from));
	if (filters.to) conditions.push(lte(feedConsumption.consumptionDate, filters.to));

	const where = conditions.length ? and(...conditions) : undefined;

	const [row] = await db
		.select({
			totalKg: sql<string>`coalesce(sum(${feedConsumption.quantityKg}), 0)::text`,
			totalCost: sql<string>`coalesce(sum(${feedConsumption.quantityKg} * coalesce(${feedConsumption.costPerKg}, 0)), 0)::text`,
			entries: sql<number>`count(*)::int`
		})
		.from(feedConsumption)
		.where(where);

	return row ?? { totalKg: '0', totalCost: '0', entries: 0 };
}

// ─── Overlap check (for the action) ─────────────────────────────────
// Returns the ID of an existing entry for the same batch+date,
// optionally excluding a given row (for updates).
export async function findConflictingFeedEntry(
	batchId: number,
	consumptionDate: string,
	excludeId?: number
): Promise<number | null> {
	const conditions = [
		eq(feedConsumption.batchId, batchId),
		eq(feedConsumption.consumptionDate, consumptionDate)
	];
	if (excludeId !== undefined) {
		conditions.push(sql`${feedConsumption.id} <> ${excludeId}`);
	}

	const [row] = await db
		.select({ id: feedConsumption.id })
		.from(feedConsumption)
		.where(and(...conditions))
		.limit(1);

	return row?.id ?? null;
}

// ─── Batch status guard (for the action) ────────────────────────────
// Returns { id, name, arrivalDate, status } or null.
export async function getBatchForFeedGuard(batchId: number) {
	const [row] = await db
		.select({
			id: batches.id,
			name: batches.name,
			arrivalDate: batches.arrivalDate,
			status: batches.status
		})
		.from(batches)
		.where(eq(batches.id, batchId))
		.limit(1);

	return row ?? null;
}
