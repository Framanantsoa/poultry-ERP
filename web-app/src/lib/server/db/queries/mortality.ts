import { and, desc, eq, gte, lte, sql, count } from 'drizzle-orm';
import type { MortalityListFilters } from '#lib/schemas/mortality.ts';
import { batches, mortality } from '../schema';
import { db } from '..';

export type MortalityListItem = {
	id: number;
	batchId: number;
	batchName: string | null;
	eventDate: string;
	deaths: number;
	cause: string | null;
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
export async function listMortalities(
	filters: MortalityListFilters
): Promise<PaginatedResult<MortalityListItem>> {
	const { page, perPage, batchId, from, to } = filters;

	const conditions = [];
	if (batchId) conditions.push(eq(mortality.batchId, batchId));
	if (from) conditions.push(gte(mortality.eventDate, from));
	if (to) conditions.push(lte(mortality.eventDate, to));

	const where = conditions.length ? and(...conditions) : undefined;

	const [rows, [{ value: total }]] = await Promise.all([
		db
			.select({
				id: mortality.id,
				batchId: mortality.batchId,
				batchName: batches.name,
				eventDate: mortality.eventDate,
				deaths: mortality.deaths,
				cause: mortality.cause,
				createdAt: mortality.createdAt
			})
			.from(mortality)
			.leftJoin(batches, eq(mortality.batchId, batches.id))
			.where(where)
			.orderBy(desc(mortality.eventDate), desc(mortality.id))
			.limit(perPage)
			.offset((page - 1) * perPage),

		db.select({ value: count() }).from(mortality).where(where)
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
export async function getMortalityById(id: number) {
	const [row] = await db
		.select({
			id: mortality.id,
			batchId: mortality.batchId,
			batchName: batches.name,
			eventDate: mortality.eventDate,
			deaths: mortality.deaths,
			cause: mortality.cause,
			notes: mortality.notes,
			source: mortality.source,
			createdAt: mortality.createdAt,
			updatedAt: mortality.updatedAt
		})
		.from(mortality)
		.leftJoin(batches, eq(mortality.batchId, batches.id))
		.where(eq(mortality.id, id));

	return row ?? null;
}

// ─── Aggregate totals (for KPI cards) ───────────────────────────────
export async function getMortalityTotals(filters: MortalityListFilters) {
	const conditions = [];
	if (filters.batchId) conditions.push(eq(mortality.batchId, filters.batchId));
	if (filters.from) conditions.push(gte(mortality.eventDate, filters.from));
	if (filters.to) conditions.push(lte(mortality.eventDate, filters.to));

	const where = conditions.length ? and(...conditions) : undefined;

	const [row] = await db
		.select({
			totalDeaths: sql<number>`coalesce(sum(${mortality.deaths}), 0)::int`,
			entries: sql<number>`count(*)::int`,
			days: sql<number>`count(distinct ${mortality.eventDate})::int`
		})
		.from(mortality)
		.where(where);

	return row ?? { totalDeaths: 0, entries: 0, days: 0 };
}

// ─── Batch status guard ─────────────────────────────────────────────
export async function getBatchForMortalityGuard(batchId: number) {
	const [row] = await db
		.select({
			id: batches.id,
			name: batches.name,
			arrivalDate: batches.arrivalDate,
			status: batches.status,
			currentCount: batches.currentCount
		})
		.from(batches)
		.where(eq(batches.id, batchId))
		.limit(1);

	return row ?? null;
}

// ─── Deaths already recorded for a batch+date ───────────────────────
// Used to warn if new deaths would exceed the current bird count.
export async function getDeathsOnDate(
	batchId: number,
	eventDate: string,
	excludeId?: number
): Promise<number> {
	const conditions = [
		eq(mortality.batchId, batchId),
		eq(mortality.eventDate, eventDate)
	];
	if (excludeId !== undefined) {
		conditions.push(sql`${mortality.id} <> ${excludeId}`);
	}

	const [row] = await db
		.select({ total: sql<number>`coalesce(sum(${mortality.deaths}), 0)::int` })
		.from(mortality)
		.where(and(...conditions));

	return row?.total ?? 0;
}
