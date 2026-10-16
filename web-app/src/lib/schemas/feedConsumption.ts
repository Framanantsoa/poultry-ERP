import { z } from 'zod';

// Must match the Postgres enum in your DB (logSourceEnum)
export const feedSourceValues = ['manual', 'import', 'api'] as const;
export type FeedSource = (typeof feedSourceValues)[number];

// Reusable pieces (mirrors eggProduction.ts)
const optionalNumberFromInput = z
	.union([z.coerce.number().min(0), z.literal('').transform(() => null)])
	.nullable()
	.optional();

const optionalText = (max = 2000) =>
	z
		.string()
		.max(max)
		.optional()
		.nullable()
		.transform((v) => (v === '' ? null : (v ?? null)));

// ─── Base object (NO refinements) ───────────────────────────────────
const feedConsumptionBaseSchema = z.object({
	batchId: z.coerce.number().int().positive({ message: 'Select a batch.' }),

	consumptionDate: z.string().min(1, { message: 'Pick a date.' }),

	// Quantity must be strictly positive (> 0)
	quantityKg: z.coerce
		.number()
		.positive({ message: 'Quantity must be greater than 0.' }),

	feedType: optionalText(120),

	// Cost per kg is optional, but if provided must be > 0
	costPerKg: z
		.union([
			z.coerce.number().positive({ message: 'Cost per kg must be greater than 0.' }),
			z.literal('').transform(() => null)
		])
		.nullable()
		.optional(),

	notes: optionalText(2000),
	source: z.enum(feedSourceValues).default('manual')
});

// ─── Create ─────────────────────────────────────────────────────────
export const feedConsumptionCreateSchema = feedConsumptionBaseSchema;

export type FeedConsumptionCreateInput = z.infer<typeof feedConsumptionCreateSchema>;

// ─── Update ─────────────────────────────────────────────────────────
// Same shape minus `source` (user can't change origin).
// No cross-field refinements to share here, so `.omit()` works directly.
export const feedConsumptionUpdateSchema = feedConsumptionBaseSchema.omit({
	source: true
});

export type FeedConsumptionUpdateInput = z.infer<typeof feedConsumptionUpdateSchema>;

// ─── List filters (search params) ───────────────────────────────────
export const feedConsumptionListFiltersSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	perPage: z.coerce.number().int().min(5).max(100).default(10),
	batchId: z.coerce.number().int().positive().optional(),
	from: z.string().optional(), // YYYY-MM-DD
	to: z.string().optional() // YYYY-MM-DD
});

export type FeedConsumptionListFilters = z.infer<
	typeof feedConsumptionListFiltersSchema
>;
