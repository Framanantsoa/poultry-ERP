import { createBatch, listBreedsForSelect } from '#lib/server/db/queries/batches.ts';
import { batchSchema } from '#lib/schemas/batch.ts';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import type { BreedOption } from '#lib/server/db/queries/batches.ts';
import { BreedNotActiveError } from '#lib/server/db/queries/batches.ts';
import type { BatchFormResult } from '#lib/types/form.ts';

export const load: PageServerLoad = async ()
 : Promise<{ breeds: BreedOption[] }> => {
	return { breeds: await listBreedsForSelect() };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const raw = {
			code: data.get('code'),
			name: data.get('name'),
			breedId: data.get('breedId') ?? '',
			initialCount: data.get('initialCount'),
			arrivalDate: data.get('arrivalDate'),
			notes: data.get('notes') ?? ''
		};

		const parsed = batchSchema.safeParse(raw);

		if (!parsed.success) {
			const { fieldErrors } = z.flattenError(parsed.error);
			return fail(400, {
				errors: {
					code: fieldErrors.code ?? [],
					name: fieldErrors.name ?? [],
					breedId: fieldErrors.breedId ?? [],
					initialCount: fieldErrors.initialCount ?? [],
					arrivalDate: fieldErrors.arrivalDate ?? [],
					notes: fieldErrors.notes ?? []
				},
				values: Object.fromEntries(data)
			});
		}

		try {
			const row = await createBatch(parsed.data);
		} 
        catch (err: any) {
			if (err instanceof BreedNotActiveError) {
                return fail<BatchFormResult>(400, {
                    errors: {
                        breedId: ['This breed has been archived and cannot be assigned'],
                        name: [], code: [], initialCount: [],
                        arrivalDate: [], notes: []
                    },
                    values: Object.fromEntries(data)
                });
            }
            else if (err?.code === '23505') {
                return fail<BatchFormResult>(409, {
                    errors: {
                        code: ['A batch with this code already exists'],
                        name: [], breedId: [], initialCount: [],
                        arrivalDate: [], notes: []
                    },
                    values: Object.fromEntries(data)
                });
            }
            console.error('Create batch failed:', err);
            return fail<BatchFormResult>(500, { message: 'Failed to create batch' });
		}

		throw redirect(303, '/batches');
	}
};
