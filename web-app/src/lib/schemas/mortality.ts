import { z } from 'zod';

// Must match the Postgres enum in your DB (logSourceEnum)
export const mortalitySourceValues = ['manual', 'import', 'api'] as const;
export type MortalitySource = (typeof mortalitySourceValues)[number];

const optionalText = (max = 2000) =>
	z
		.string()
		.max(max)
		.optional()
		.nullable()
		.transform((v) => (v === '' ? null : (v ?? null)));

// ─── Base object (NO refinements) ───────────────────────────────────
const mortalityBaseSchema = z.object({
	batchId: z.coerce.number().int().positive({ message: 'Select a batch.' }),

	eventDate: z.string().min(1, { message: 'Pick a date.' }),

	// Deaths must be strictly positive (>= 0)
	deaths: z.coerce
        .number()
        .int({ message: 'Must be a whole number.' })
        .min(0, { message: 'Deaths cannot be negative.' }),

	cause: optionalText(250),

	notes: optionalText(2000),

	source: z.enum(mortalitySourceValues).default('manual')
});

// ─── Create ─────────────────────────────────────────────────────────
export const mortalityCreateSchema = mortalityBaseSchema;

export type MortalityCreateInput = z.infer<typeof mortalityCreateSchema>;

// ─── Update ─────────────────────────────────────────────────────────
// Same shape minus `source`
export const mortalityUpdateSchema = mortalityBaseSchema.omit({ source: true });

export type MortalityUpdateInput = z.infer<typeof mortalityUpdateSchema>;

// ─── List filters ───────────────────────────────────────────────────
export const mortalityListFiltersSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	perPage: z.coerce.number().int().min(5).max(100).default(10),
	batchId: z.coerce.number().int().positive().optional(),
	from: z.string().optional(), // YYYY-MM-DD
	to: z.string().optional() // YYYY-MM-DD
});

export type MortalityListFilters = z.infer<typeof mortalityListFiltersSchema>;
