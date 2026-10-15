import { z } from 'zod';

export const batchStatusValues = ['active', 'completed', 'archived'] as const;
export type BatchStatus = (typeof batchStatusValues)[number];

export const batchSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, 'Code is required')
        .max(40, 'Code must be 40 characters or fewer')
        .regex(/^[A-Za-z0-9\-\/]+$/, 'Only letters, numbers, dashes and slashes'),

    name: z
        .string()
        .trim()
        .min(1, 'Name is required')
        .max(120, 'Name must be 120 characters or fewer'),

    breedId: z
        .union([z.coerce.number().int().positive(), z.literal('')])
        .transform((v) => (v === '' ? null : v))
        .nullable(),

    initialCount: z.coerce
        .number()
        .int('Must be a whole number')
        .positive('Must be greater than 0')
        .max(1_000_000, 'Too large'),

    arrivalDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),

    status: z.enum(batchStatusValues).default('active'),

    notes: z
        .string()
        .trim()
        .max(2000, 'Notes must be 2000 characters or fewer')
        .optional()
        .or(z.literal(''))
        .transform((v) => (v === '' ? undefined : v))
});

export type BatchInput = z.infer<typeof batchSchema>;
