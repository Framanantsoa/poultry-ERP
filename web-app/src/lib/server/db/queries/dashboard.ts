import { db } from '#lib/server/db/index.ts';
import { batches, eggProduction, feedConsumption, mortality } from '#lib/server/db/schema.ts';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

// ─── Types ──────────────────────────────────────────────────────────
export type KpiSummary = {
	activeBatches: number;
	liveBirds: number;
	eggsToday: number;
	feedThisWeek: string;
	deathsThisWeek: number;
	mortalityRate: number;
};

export type DateRange = {
	from: string; // YYYY-MM-DD inclusive
	to: string;   // YYYY-MM-DD inclusive
};

export type DailyPoint = {
	date: string;
	value: number;
};

export type DailyFeedPoint = {
	date: string;
	kg: number;
};

// ─── Helpers ────────────────────────────────────────────────────────
function isoDaysAgo(n: number): string {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d.toISOString().slice(0, 10);
}

function todayISO(): string {
	return new Date().toISOString().slice(0, 10);
}

/** Expand a range into an ordered list of YYYY-MM-DD strings */
function expandRange(range: DateRange): string[] {
	const out: string[] = [];
	const cur = new Date(range.from + 'T00:00:00Z');
	const end = new Date(range.to + 'T00:00:00Z');
	while (cur <= end) {
		out.push(cur.toISOString().slice(0, 10));
		cur.setUTCDate(cur.getUTCDate() + 1);
	}
	return out;
}

/** Fill missing dates in a series with zeros */
function fillSeries(range: DateRange, rows: { date: string; value: number }[]): DailyPoint[] {
	const map = new Map(rows.map((r) => [r.date, r.value]));
	return expandRange(range).map((date) => ({ date, value: map.get(date) ?? 0 }));
}

// ─── Date range builders (called from the server load) ──────────────
/**
 * Given `?range=week&week=2026-W42`, return the ISO date range for that week.
 * Week format: `YYYY-Www` (ISO 8601, Monday–Sunday).
 * Falls back to the current week if invalid.
 */
export function weekRange(weekParam?: string): DateRange {
	const now = new Date();
	let year: number;
	let week: number;

	const match = weekParam?.match(/^(\d{4})-W(\d{2})$/);
	if (match) {
		year = Number(match[1]);
		week = Number(match[2]);
	} else {
		({ year, week } = getIsoWeek(now));
	}

	// ISO week: week 1 contains the first Thursday of the year.
	// Monday of that week:
	const jan4 = new Date(Date.UTC(year, 0, 4));
	const jan4Day = jan4.getUTCDay() || 7; // 1..7 (Mon..Sun)
	const week1Monday = new Date(jan4);
	week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

	const monday = new Date(week1Monday);
	monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

	const sunday = new Date(monday);
	sunday.setUTCDate(monday.getUTCDate() + 6);

	return {
		from: monday.toISOString().slice(0, 10),
		to: sunday.toISOString().slice(0, 10)
	};
}

export function monthRange(monthParam?: string): DateRange {
	const now = new Date();
	let year: number;
	let month: number; // 1–12

	const match = monthParam?.match(/^(\d{4})-(\d{2})$/);
	if (match) {
		year = Number(match[1]);
		month = Number(match[2]);
	} else {
		year = now.getUTCFullYear();
		month = now.getUTCMonth() + 1;
	}

	const from = new Date(Date.UTC(year, month - 1, 1));
	const to = new Date(Date.UTC(year, month, 0)); // last day of month
	return {
		from: from.toISOString().slice(0, 10),
		to: to.toISOString().slice(0, 10)
	};
}

/** Get ISO week {year, week} for a date */
export function getIsoWeek(date: Date): { year: number; week: number } {
	const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	return { year: d.getUTCFullYear(), week };
}

/** Format an ISO week for the input value (YYYY-Www) */
export function isoWeekString(date: Date): string {
	const { year, week } = getIsoWeek(date);
	return `${year}-W${String(week).padStart(2, '0')}`;
}

// ─── KPI summary (unchanged, still "this week / today") ─────────────
export async function getKpiSummary(): Promise<KpiSummary> {
	const today = todayISO();
	const weekAgo = isoDaysAgo(6);

	const [[batchesRow], [eggsTodayRow], [feedWeekRow], [deathsWeekRow]] = await Promise.all([
		db
			.select({
				count: sql<number>`count(*)::int`,
				birds: sql<number>`coalesce(sum(${batches.currentCount}), 0)::int`
			})
			.from(batches)
			.where(eq(batches.status, 'active')),

		db
			.select({ total: sql<number>`coalesce(sum(${eggProduction.eggsCollected}), 0)::int` })
			.from(eggProduction)
			.where(eq(eggProduction.productionDate, today)),

		db
			.select({ total: sql<string>`coalesce(sum(${feedConsumption.quantityKg}), 0)::text` })
			.from(feedConsumption)
			.where(
				and(
					gte(feedConsumption.consumptionDate, weekAgo),
					lte(feedConsumption.consumptionDate, today)
				)
			),

		db
			.select({ total: sql<number>`coalesce(sum(${mortality.deaths}), 0)::int` })
			.from(mortality)
			.where(and(gte(mortality.eventDate, weekAgo), lte(mortality.eventDate, today)))
	]);

	const liveBirds = batchesRow?.birds ?? 0;
	const deathsThisWeek = deathsWeekRow?.total ?? 0;
	const mortalityRate =
		liveBirds > 0 ? Number(((deathsThisWeek / liveBirds) * 100).toFixed(1)) : 0;

	return {
		activeBatches: batchesRow?.count ?? 0,
		liveBirds,
		eggsToday: eggsTodayRow?.total ?? 0,
		feedThisWeek: feedWeekRow?.total ?? '0',
		deathsThisWeek,
		mortalityRate
	};
}

// ─── Range-aware series ─────────────────────────────────────────────
export async function getDailyEggs(range: DateRange): Promise<DailyPoint[]> {
	const rows = await db
		.select({
			date: eggProduction.productionDate,
			value: sql<number>`coalesce(sum(${eggProduction.eggsCollected}), 0)::int`
		})
		.from(eggProduction)
		.where(
			and(
				gte(eggProduction.productionDate, range.from),
				lte(eggProduction.productionDate, range.to)
			)
		)
		.groupBy(eggProduction.productionDate)
		.orderBy(eggProduction.productionDate);

	return fillSeries(range, rows);
}

export async function getDailyFeed(range: DateRange): Promise<DailyFeedPoint[]> {
	const rows = await db
		.select({
			date: feedConsumption.consumptionDate,
			value: sql<number>`coalesce(sum(${feedConsumption.quantityKg}), 0)::float`
		})
		.from(feedConsumption)
		.where(
			and(
				gte(feedConsumption.consumptionDate, range.from),
				lte(feedConsumption.consumptionDate, range.to)
			)
		)
		.groupBy(feedConsumption.consumptionDate)
		.orderBy(feedConsumption.consumptionDate);

	const map = new Map(rows.map((r) => [r.date, r.value]));
	return expandRange(range).map((date) => ({ date, kg: map.get(date) ?? 0 }));
}

export async function getDailyMortality(range: DateRange): Promise<DailyPoint[]> {
	const rows = await db
		.select({
			date: mortality.eventDate,
			value: sql<number>`coalesce(sum(${mortality.deaths}), 0)::int`
		})
		.from(mortality)
		.where(
			and(
				gte(mortality.eventDate, range.from),
				lte(mortality.eventDate, range.to)
			)
		)
		.groupBy(mortality.eventDate)
		.orderBy(mortality.eventDate);

	return fillSeries(range, rows);
}
