import { getBatchById, updateBatch, listBreedsForSelect } from '#lib/server/db/queries/batch.ts';
import { batchSchema } from '#lib/schemas/batch.ts';
import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import type { BatchFormResult } from '#lib/types/form.ts';
import type { Batch } from '#lib/server/db/schema.ts';
import { BreedNotActiveError } from '#lib/server/db/queries/batch.ts';

type BreedOption = { id: number; name: string };

export const load: PageServerLoad = async ({ params })
 : Promise<{ batch: Batch; breeds: BreedOption[] }> => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) throw error(404, 'Batch not found');

	const batch = await getBatchById(id);
	if (!batch) throw error(404, 'Batch not found');

	const breeds = await listBreedsForSelect(batch.breedId ?? undefined);

	return { batch, breeds };

};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = Number(params.id);
		if (!Number.isInteger(id) || id <= 0) throw error(404, 'Batch not found');

		const data = await request.formData();

		const parsed = batchSchema.safeParse({
			code: data.get('code'),
			name: data.get('name'),
			breedId: data.get('breedId') ?? '',
			initialCount: data.get('initialCount'),
			arrivalDate: data.get('arrivalDate'),
			notes: data.get('notes') ?? ''
		});

		if (!parsed.success) {
			const { fieldErrors } = z.flattenError(parsed.error);
			return fail<BatchFormResult>(400, {
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
			await updateBatch(id, parsed.data);
		} catch (err: any) {
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
			console.error('Update batch failed:', err);
			return fail<BatchFormResult>(500, { message: 'Failed to update batch' });
		}

		throw redirect(303, '/batches');
	}
};
