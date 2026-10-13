import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listActiveBreeds, softDeleteBreed } from '#lib/server/db/queries/breed.ts';

export const load: PageServerLoad = async () => {
	return {
		breeds: await listActiveBreeds()
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { message: 'Invalid breed ID' });
		}

		try {
			await softDeleteBreed(id);
			return { success: true };
		} catch (err) {
			console.error('Failed to delete breed:', err);
			return fail(500, { message: 'Failed to delete breed' });
		}
	}
};
