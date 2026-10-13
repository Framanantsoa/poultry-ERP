import { 
	pgTable, serial, text, varchar, integer, numeric, timestamp, date, index, uniqueIndex, pgEnum
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────
export const batchStatusEnum = pgEnum('batch_status', ['active', 'completed', 'archived']);
export const logSourceEnum = pgEnum('log_source', ['manual', 'import', 'api']);

// ─────────────────────────────────────────────────────────────
// Breeds — reference table
// ─────────────────────────────────────────────────────────────
export const breeds = pgTable('breeds', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 120 }).notNull().unique(),
	notes: text('notes'),

	// Soft delete: NULL = active, timestamp = deleted
	deletedAt: timestamp('deleted_at', { withTimezone: true }),

	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => [
	index('breeds_deleted_at_idx').on(t.deletedAt)
]);

// ─────────────────────────────────────────────────────────────
// Batches — the central entity
// ─────────────────────────────────────────────────────────────
export const batches = pgTable('batches', {
	id: serial('id').primaryKey(),
	// Human-friendly identifier, e.g. "B-2026-001"
	code: varchar('code', { length: 40 }).notNull().unique(),
	name: varchar('name', { length: 120 }).notNull(),

	breedId: integer('breed_id')
		.references(() => breeds.id, { onDelete: 'set null' }),

	// Flock counts
	initialCount: integer('initial_count').notNull(),
	currentCount: integer('current_count').notNull(),

	// Lifecycle dates
	arrivalDate: date('arrival_date').notNull(),
	endDate: date('end_date'),

	status: batchStatusEnum('status').default('active').notNull(),
	notes: text('notes'),

	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => [
	index('batches_status_idx').on(t.status),
	index('batches_breed_idx').on(t.breedId),
	index('batches_arrival_idx').on(t.arrivalDate)
]);

// ─────────────────────────────────────────────────────────────
// Egg production
// ─────────────────────────────────────────────────────────────
export const eggProduction = pgTable('egg_productions', {
	id: serial('id').primaryKey(),
	batchId: integer('batch_id')
		.notNull()
		.references(() => batches.id, { onDelete: 'cascade' }),

	productionDate: date('production_date').notNull(),

	// Total eggs collected
	eggsCollected: integer('eggs_collected').notNull(),
	// Optional quality breakdown
	eggsBroken: integer('eggs_broken').default(0).notNull(),
	eggsDiscarded: integer('eggs_discarded').default(0).notNull(),

	// Optional weight in kg (numeric for precision)
	totalWeightKg: numeric('total_weight_kg', { precision: 10, scale: 3 }),

	notes: text('notes'),
	source: logSourceEnum('source').default('manual').notNull(),

	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
},
(t) => [
	uniqueIndex('egg_batch_date_unique').on(t.batchId, t.productionDate),
	index('egg_batch_idx').on(t.batchId),
	index('egg_date_idx').on(t.productionDate)
]);

// ─────────────────────────────────────────────────────────────
// Feed consumption
// ─────────────────────────────────────────────────────────────
export const feedConsumption = pgTable('feed_consumptions', {
	id: serial('id').primaryKey(),
	batchId: integer('batch_id')
		.notNull()
		.references(() => batches.id, { onDelete: 'cascade' }),

	consumptionDate: date('consumption_date').notNull(),
	quantityKg: numeric('quantity_kg', { precision: 10, scale: 3 }).notNull(),

	// Optional feed type / brand
	feedType: varchar('feed_type', { length: 120 }),
	// Optional cost per kg in your local currency
	costPerKg: numeric('cost_per_kg', { precision: 10, scale: 4 }),

	notes: text('notes'),
	source: logSourceEnum('source').default('manual').notNull(),

	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
},
(t) => [
	uniqueIndex('feed_batch_date_unique').on(t.batchId, t.consumptionDate),
	index('feed_batch_idx').on(t.batchId),
	index('feed_date_idx').on(t.consumptionDate)
]);

// ─────────────────────────────────────────────────────────────
// Mortality
// ─────────────────────────────────────────────────────────────
export const mortality = pgTable('mortalities', {
	id: serial('id').primaryKey(),
	batchId: integer('batch_id')
		.notNull()
		.references(() => batches.id, { onDelete: 'cascade' }),

	eventDate: date('event_date').notNull(),
	deaths: integer('deaths').notNull(),
	// Optional categorization
	cause: varchar('cause', { length: 250 }),

	notes: text('notes'),
	source: logSourceEnum('source').default('manual').notNull(),

	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
},
(t) => [
	index('mortality_batch_idx').on(t.batchId),
	index('mortality_date_idx').on(t.eventDate)
]);

// ─────────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────────
export const breedsRelations = relations(breeds, ({ many }) => ({
	batches: many(batches)
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
	breed: one(breeds, {
		fields: [batches.breedId],
		references: [breeds.id]
	}),
	eggProduction: many(eggProduction),
	feedConsumption: many(feedConsumption),
	mortality: many(mortality)
}));

export const eggProductionRelations = relations(eggProduction, ({ one }) => ({
	batch: one(batches, {
		fields: [eggProduction.batchId],
		references: [batches.id]
	})
}));

export const feedConsumptionRelations = relations(feedConsumption, ({ one }) => ({
	batch: one(batches, {
		fields: [feedConsumption.batchId],
		references: [batches.id]
	})
}));

export const mortalityRelations = relations(mortality, ({ one }) => ({
	batch: one(batches, {
		fields: [mortality.batchId],
		references: [batches.id]
	})
}));

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type Breed = typeof breeds.$inferSelect;
export type NewBreed = typeof breeds.$inferInsert;

export type Batch = typeof batches.$inferSelect;
export type NewBatch = typeof batches.$inferInsert;

export type EggProduction = typeof eggProduction.$inferSelect;
export type NewEggProduction = typeof eggProduction.$inferInsert;

export type FeedConsumption = typeof feedConsumption.$inferSelect;
export type NewFeedConsumption = typeof feedConsumption.$inferInsert;

export type Mortality = typeof mortality.$inferSelect;
export type NewMortality = typeof mortality.$inferInsert;
