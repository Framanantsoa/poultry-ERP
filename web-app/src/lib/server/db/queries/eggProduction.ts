import { and, desc, eq, gte, lte, sql, count } from 'drizzle-orm';
import type { EggProductionListFilters } from '#lib/schemas/eggProduction.ts';
import { batches, eggProduction } from '../schema';
import { db } from '..';

export type EggProductionListItem = {
	id: number;
	batchId: number;
	batchName: string | null;
	productionDate: string;
	eggsCollected: number;
	eggsBroken: number;
	eggsDiscarded: number;
	totalWeightKg: string | null;
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
export async function listEggProductions(
	filters: EggProductionListFilters
): Promise<PaginatedResult<EggProductionListItem>> {
	const { page, perPage, batchId, from, to } = filters;

	const conditions = [];
	if (batchId) conditions.push(eq(eggProduction.batchId, batchId));
	if (from) conditions.push(gte(eggProduction.productionDate, from));
	if (to) conditions.push(lte(eggProduction.productionDate, to));

	const where = conditions.length ? and(...conditions) : undefined;

	const [rows, [{ value: total }]] = await Promise.all([
		db
			.select({
				id: eggProduction.id,
				batchId: eggProduction.batchId,
				batchName: batches.name,
				productionDate: eggProduction.productionDate,
				eggsCollected: eggProduction.eggsCollected,
				eggsBroken: eggProduction.eggsBroken,
				eggsDiscarded: eggProduction.eggsDiscarded,
				totalWeightKg: eggProduction.totalWeightKg,
				createdAt: eggProduction.createdAt
			})
			.from(eggProduction)
			.leftJoin(batches, eq(eggProduction.batchId, batches.id))
			.where(where)
			.orderBy(
				desc(eggProduction.productionDate),
				desc(eggProduction.id) // stable tie-break
			)
			.limit(perPage)
			.offset((page - 1) * perPage),

		db
			.select({ value: count() })
			.from(eggProduction)
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
export async function getEggProductionById(id: number) {
	const [row] = await db
		.select({
			id: eggProduction.id,
			batchId: eggProduction.batchId,
			batchName: batches.name,
			productionDate: eggProduction.productionDate,
			eggsCollected: eggProduction.eggsCollected,
			eggsBroken: eggProduction.eggsBroken,
			eggsDiscarded: eggProduction.eggsDiscarded,
			totalWeightKg: eggProduction.totalWeightKg,
			notes: eggProduction.notes,
			source: eggProduction.source,
			createdAt: eggProduction.createdAt,
			updatedAt: eggProduction.updatedAt
		})
		.from(eggProduction)
		.leftJoin(batches, eq(eggProduction.batchId, batches.id))
		.where(eq(eggProduction.id, id));

	return row ?? null;
}

// ─── Aggregate totals (for the list header / KPIs) ──────────────────
export async function getEggProductionTotals(filters: EggProductionListFilters) {
	const conditions = [];
	if (filters.batchId) conditions.push(eq(eggProduction.batchId, filters.batchId));
	if (filters.from) conditions.push(gte(eggProduction.productionDate, filters.from));
	if (filters.to) conditions.push(lte(eggProduction.productionDate, filters.to));

	const where = conditions.length ? and(...conditions) : undefined;

	const [row] = await db
		.select({
			collected: sql<number>`coalesce(sum(${eggProduction.eggsCollected}), 0)::int`,
			broken: sql<number>`coalesce(sum(${eggProduction.eggsBroken}), 0)::int`,
			discarded: sql<number>`coalesce(sum(${eggProduction.eggsDiscarded}), 0)::int`
		})
		.from(eggProduction)
		.where(where);

	return row ?? { collected: 0, broken: 0, discarded: 0 };
}
