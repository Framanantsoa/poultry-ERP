import { z } from 'zod';

// Must match the Postgres enum in your DB (logSourceEnum)
export const eggSourceValues = ['manual', 'import', 'api'] as const;
export type EggSource = (typeof eggSourceValues)[number];

// Reusable pieces
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
// This is the schema `.omit()` / `.extend()` etc. can operate on.
const eggProductionBaseSchema = z.object({
	batchId: z.coerce.number().int().positive({ message: 'Select a batch.' }),
	productionDate: z.string().min(1, { message: 'Pick a date.' }),
	eggsCollected: z.coerce
		.number()
		.int()
		.min(0, { message: 'Cannot be negative.' }),
	eggsBroken: z.coerce.number().int().min(0).default(0),
	eggsDiscarded: z.coerce.number().int().min(0).default(0),
	totalWeightKg: optionalNumberFromInput,
	notes: optionalText(2000),
	source: z.enum(eggSourceValues).default('manual')
});

// Shared cross-field rule
const brokenDiscardedRule = (d: {
	eggsCollected: number;
	eggsBroken: number;
	eggsDiscarded: number;
}) => d.eggsBroken + d.eggsDiscarded <= d.eggsCollected;

const brokenDiscardedRefine = {
	message: 'Broken + discarded cannot exceed collected.',
	path: ['eggsBroken']
};

// ─── Create ─────────────────────────────────────────────────────────
export const eggProductionCreateSchema = eggProductionBaseSchema.refine(
	brokenDiscardedRule,
	brokenDiscardedRefine
);

export type EggProductionCreateInput = z.infer<typeof eggProductionCreateSchema>;

// ─── Update ─────────────────────────────────────────────────────────
// Derive from the base (no refinements), then apply the refine.
export const eggProductionUpdateSchema = eggProductionBaseSchema
	.omit({ source: true })
	.refine(brokenDiscardedRule, brokenDiscardedRefine);

export type EggProductionUpdateInput = z.infer<typeof eggProductionUpdateSchema>;

// ─── List filters (search params) ───────────────────────────────────
export const eggProductionListFiltersSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	perPage: z.coerce.number().int().min(5).max(100).default(10),
	batchId: z.coerce.number().int().positive().optional(),
	from: z.string().optional(),
	to: z.string().optional()
});

export type EggProductionListFilters = z.infer<
	typeof eggProductionListFiltersSchema
>;