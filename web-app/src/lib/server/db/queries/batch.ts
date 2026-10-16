import type { BatchInput, BatchStatus } from '#lib/schemas/batch.ts';
import type { Batch, Breed } from '../schema';
import { eq, isNull, and, desc, sql, or } from 'drizzle-orm';
import { db } from '..';
import { batches, breeds } from '../schema';

/** Row shape for the batch list view (batch fields + joined breed name). */
export type BatchListItem = {
	id: number;
	code: string;
	name: string;
	status: BatchStatus;
	initialCount: number;
	currentCount: number;
	arrivalDate: string;
	endDate: string | null;
	breedId: number | null;
	breedName: string | null;
};

/** Minimal breed shape for form dropdowns. */
export type BreedOption = {
	id: number;
	name: string;
};

async function isBreedActive(breedId: number): Promise<boolean> {
	const [row] = await db
		.select({ id: breeds.id })
		.from(breeds)
		.where(and(eq(breeds.id, breedId), isNull(breeds.deletedAt)))
		.limit(1);
	return !!row;
}


/** List batches with breed name attached. Optional status filter. */
export async function listBatches(
	filters?: { status?: BatchStatus }
): Promise<BatchListItem[]> {
	const base = db
		.select({
			id: batches.id,
			code: batches.code,
			name: batches.name,
			status: batches.status,
			initialCount: batches.initialCount,
			currentCount: batches.currentCount,
			arrivalDate: batches.arrivalDate,
			endDate: batches.endDate,
			breedId: batches.breedId,
			breedName: breeds.name
		})
		.from(batches)
		.leftJoin(breeds, eq(batches.breedId, breeds.id))
		.orderBy(desc(batches.arrivalDate), desc(batches.id));

	if (filters?.status) {
		return base.where(eq(batches.status, filters.status));
	}
	return base;
}

/** All active breeds for the form's dropdown. */
export async function listBreedsForSelect(includeId?: number): Promise<BreedOption[]> {
	const conditions = includeId
		? or(isNull(breeds.deletedAt), eq(breeds.id, includeId))
		: isNull(breeds.deletedAt);

	return db
		.select({ id: breeds.id, name: breeds.name })
		.from(breeds)
		.where(conditions)
		.orderBy(breeds.name);
}

/** One batch by ID. */
export async function getBatchById(id: number): Promise<Batch | null> {
	const [row] = await db.select().from(batches).where(eq(batches.id, id)).limit(1);
	return row ?? null;
}

/** Create a batch. */
export async function createBatch(input: BatchInput): Promise<Batch> {
	if (input.breedId != null && !(await isBreedActive(input.breedId))) {
		throw new Error('BREED_NOT_ACTIVE');
	}

	const [row] = await db
		.insert(batches)
		.values({
			code: input.code,
			name: input.name,
			breedId: input.breedId ?? null,
			initialCount: input.initialCount,
			currentCount: input.initialCount,
			arrivalDate: input.arrivalDate,
			endDate: null,
			status: input.status,
			notes: input.notes
		})
		.returning();

	if (!row) throw new Error('Failed to create batch');
	return row;
}

/** Update a batch. */
export async function updateBatch(id: number, input: BatchInput): Promise<Batch> {
	if (input.breedId != null && !(await isBreedActive(input.breedId))) {
		throw new Error('BREED_NOT_ACTIVE');
	}

	const [row] = await db
		.update(batches)
		.set({
			code: input.code,
			name: input.name,
			breedId: input.breedId ?? null,
			initialCount: input.initialCount,
			currentCount: input.initialCount,
			arrivalDate: input.arrivalDate,
			endDate: null,
			status: input.status,
			notes: input.notes,
			updatedAt: new Date()
		})
		.where(eq(batches.id, id))
		.returning();

	if (!row) throw new Error('Batch not found after update');
	return row;
}

/** Hard delete. Cascades to egg/feed/mortality logs. */
export async function deleteBatch(id: number): Promise<void> {
	await db.delete(batches).where(eq(batches.id, id));
}

/** Count logs across the 3 log tables for a batch. */
export async function countLogsForBatch(
	batchId: number
): Promise<{ eggs: number; feed: number; mortality: number }> {
	const [row] = await db.execute(sql`
		SELECT
			(SELECT COUNT(*) FROM egg_productions WHERE batch_id = ${batchId})::int AS eggs,
			(SELECT COUNT(*) FROM feed_consumptions WHERE batch_id = ${batchId})::int AS feed,
			(SELECT COUNT(*) FROM mortalities WHERE batch_id = ${batchId})::int AS mortality
	`);
	return row as { eggs: number; feed: number; mortality: number };
}


export class BreedNotActiveError extends Error {
	constructor(public breedId: number) {
		super(`Breed ${breedId} is not active`);
		this.name = 'BreedNotActiveError';
	}
}
