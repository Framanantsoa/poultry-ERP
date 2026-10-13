import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getBreedById, updateBreed } from '#lib/server/db/queries/breed.ts';
import { breedSchema } from '#lib/schemas/breed.ts';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) throw error(404, 'Breed not found');

	const breed = await getBreedById(id);
	if (!breed) throw error(404, 'Breed not found');

	return { breed };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = Number(params.id);
		if (!Number.isInteger(id) || id <= 0) throw error(404, 'Breed not found');

		const data = await request.formData();
		const parsed = breedSchema.safeParse({
			name: data.get('name'),
			notes: data.get('notes')
		});

		if (!parsed.success) {
			return fail(400, {
				errors: parsed.error.flatten().fieldErrors,
				values: { name: data.get('name'), notes: data.get('notes') }
			});
		}

		try {
			await updateBreed(id, parsed.data);
		} catch (err: any) {
			if (err?.code === '23505') {
				return fail(409, {
					errors: { name: ['A breed with this name already exists'] },
					values: { name: data.get('name'), notes: data.get('notes') }
				});
			}
			console.error('Update breed failed:', err);
			return fail(500, { message: 'Failed to update breed' });
		}

		throw redirect(303, '/breeds');
	}
};
