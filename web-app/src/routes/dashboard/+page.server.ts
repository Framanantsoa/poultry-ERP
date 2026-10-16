import {
	getDailyEggs,
	getDailyFeed,
	getDailyMortality,
	getKpiSummary,
	isoWeekString,
	monthRange,
	weekRange
} from '#lib/server/db/queries/dashboard.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// ─── Read + validate search params ───
	const rangeParam = url.searchParams.get('range') === 'month' ? 'month' : 'week';
	const weekParam = url.searchParams.get('week') ?? undefined;
	const monthParam = url.searchParams.get('month') ?? undefined;

	const range = rangeParam === 'month' ? monthRange(monthParam) : weekRange(weekParam);

	// ─── Defaults to pass to the form inputs ───
	const now = new Date();
	const defaultWeek = isoWeekString(now);
	const defaultMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

	// ─── Fetch data ───
	const [kpis, eggs, feed, mortality] = await Promise.all([
		getKpiSummary(),
		getDailyEggs(range),
		getDailyFeed(range),
		getDailyMortality(range)
	]);

	return {
		kpis,
		eggs,
		feed,
		mortality,
		range,
		filter: {
            range: rangeParam as 'week' | 'month',
            week: weekParam ?? defaultWeek,
            month: monthParam ?? defaultMonth
        }
	};
};
