import { mortalityListFiltersSchema } from '#lib/schemas/mortality.ts';
import {
	getMortalityTotals,
	listMortalities
} from '#lib/server/db/queries/mortality.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const raw = Object.fromEntries(url.searchParams);
	const parsed = mortalityListFiltersSchema.safeParse(raw);

	const filters = parsed.success ? parsed.data : { page: 1, perPage: 20 };

	const [result, totals] = await Promise.all([
		listMortalities(filters),
		getMortalityTotals(filters)
	]);

	return { ...result, totals, filters };
};
