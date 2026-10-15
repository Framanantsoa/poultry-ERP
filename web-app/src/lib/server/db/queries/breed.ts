import { eq, isNull, desc, count } from 'drizzle-orm';
import { batches, breeds } from '../schema';
import type { BreedInput } from '#lib/schemas/breed.ts';
import { db } from '..';

/** All active (non-deleted) breeds, newest first, with batch counts. */
export async function listActiveBreeds() {
	return db
		.select({
			id: breeds.id,
			name: breeds.name,
			notes: breeds.notes,
			createdAt: breeds.createdAt,
			batchCount: count(batches.id)
		})
		.from(breeds)
		.leftJoin(batches, eq(batches.breedId, breeds.id))
		.where(isNull(breeds.deletedAt))
		.groupBy(breeds.id)
		.orderBy(desc(breeds.createdAt));
}

/** All breeds including deleted — for the "archive" view. */
export async function listAllBreeds() {
	return db.select().from(breeds).orderBy(desc(breeds.createdAt));
}

/** One breed by ID (including deleted — used for detail view). */
export async function getBreedById(id: number) {
	const [row] = await db.select().from(breeds).where(eq(breeds.id, id)).limit(1);
	return row ?? null;
}

/** Count of batches that reference this breed. */
export async function countBatchesForBreed(breedId: number) {
	const [row] = await db
		.select({ n: count(batches.id) })
		.from(batches)
		.where(eq(batches.breedId, breedId));
	return row?.n ?? 0;
}

/** Create a new breed. Throws on duplicate name. */
export async function createBreed(input: BreedInput) {
	const [row] = await db
		.insert(breeds)
		.values({
			name: input.name,
			notes: input.notes
		})
		.returning();
	return row;
}

/** Update an existing breed. Throws on duplicate name. */
export async function updateBreed(id: number, input: BreedInput) {
	const [row] = await db
		.update(breeds)
		.set({
			name: input.name,
			notes: input.notes,
			updatedAt: new Date()
		})
		.where(eq(breeds.id, id))
		.returning();
	return row;
}

/** Soft delete — marks deletedAt, keeps the row for history. */
export async function softDeleteBreed(id: number) {
	await db
		.update(breeds)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(eq(breeds.id, id));
}

/** Restore a soft-deleted breed. */
export async function restoreBreed(id: number) {
	await db
		.update(breeds)
		.set({ deletedAt: null, updatedAt: new Date() })
		.where(eq(breeds.id, id));
}
