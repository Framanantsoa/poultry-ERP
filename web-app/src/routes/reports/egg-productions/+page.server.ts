import { eggProductionListFiltersSchema } from '#lib/schemas/eggProduction.ts';
import { getEggProductionTotals, listEggProductions } from '#lib/server/db/queries/eggProduction.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const raw = Object.fromEntries(url.searchParams);
	const parsed = eggProductionListFiltersSchema.safeParse(raw);

	// Fall back to defaults if the query string is garbage
	const filters = parsed.success
		? parsed.data
		: { page: 1, perPage: 20 };

	const [result, totals] = await Promise.all([
		listEggProductions(filters),
		getEggProductionTotals(filters)
	]);

	return { ...result, totals, filters };
};
