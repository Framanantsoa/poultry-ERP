import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { breedSchema } from '#lib/schemas/breed.ts';
import { createBreed } from '#lib/server/db/queries/breed.ts';

export const actions: Actions = {
	default: async ({ request }) => {
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
			await createBreed(parsed.data);
		} catch (err: any) {
			// Postgres unique violation
			if (err?.code === '23505') {
				return fail(409, {
					errors: { name: ['A breed with this name already exists'] },
					values: { name: data.get('name'), notes: data.get('notes') }
				});
			}
			console.error('Create breed failed:', err);
			return fail(500, { message: 'Failed to create breed' });
		}

		throw redirect(303, '/breeds');
	}
};