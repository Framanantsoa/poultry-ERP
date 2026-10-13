import { z } from 'zod';

export const breedSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Name is required')
		.max(120, 'Name must be 120 characters or fewer'),
	notes: z
		.string()
		.trim()
		.max(1000, 'Notes must be 1000 characters or fewer')
		.optional()
		.or(z.literal(''))
		.transform((v) => (v === '' ? undefined : v))
});

export type BreedInput = z.infer<typeof breedSchema>;
