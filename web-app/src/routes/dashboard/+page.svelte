<script lang="ts">
	import { goto } from '$app/navigation';
	import { Line, Bar } from 'svelte-chartjs';
	import {
		Chart as ChartJS,
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		BarElement,
		Title,
		Tooltip,
		Legend,
		Filler,
		type ChartOptions
	} from 'chart.js';
	import type { PageProps } from './$types';

	ChartJS.register(
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		BarElement,
		Title,
		Tooltip,
		Legend,
		Filler
	);

	let { data }: PageProps = $props();

	// ─── Local filter state (initialized from URL) ───
	// svelte-ignore state_referenced_locally
	let range = $state<'week' | 'month'>(data.filter.range);
	// svelte-ignore state_referenced_locally
	let week = $state(data.filter.week);
	// svelte-ignore state_referenced_locally
	let month = $state(data.filter.month);

	// Keep local state in sync when the URL changes (e.g., back button)
	$effect(() => {
		range = data.filter.range;
		week = data.filter.week;
		month = data.filter.month;
	});

	function applyFilter() {
		const params = new URLSearchParams();
		params.set('range', range);
		if (range === 'week') params.set('week', week);
		else params.set('month', month);

		goto(`/dashboard?${params.toString()}`, { reset: false });
	}

	function onRangeChange() {
		applyFilter();
	}

	// ─── Formatters ───
	function shortDate(iso: string) {
		const [, m, d] = iso.split('-');
		return `${d}/${m}`;
	}
	function kg(value: string | number) {
		return Number(value).toFixed(1);
	}
	function rangeLabel() {
		const from = new Date(data.range.from + 'T00:00:00Z');
		const to = new Date(data.range.to + 'T00:00:00Z');
		const fmt = (d: Date) =>
			d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
		return `${fmt(from)} → ${fmt(to)}`;
	}

	// ─── Chart data ───
	const eggLabels = $derived(data.eggs.map((p) => shortDate(p.date)));
	const eggValues = $derived(data.eggs.map((p) => p.value));
	const feedLabels = $derived(data.feed.map((p) => shortDate(p.date)));
	const feedValues = $derived(data.feed.map((p) => p.kg));
	const mortalityLabels = $derived(data.mortality.map((p) => shortDate(p.date)));
	const mortalityValues = $derived(data.mortality.map((p) => p.value));

	// ─── Chart options ───
	const lineOptions: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: { mode: 'index', intersect: false },
		plugins: {
			legend: { display: false },
			tooltip: { backgroundColor: '#1c1917', padding: 10, cornerRadius: 8 }
		},
		scales: {
			x: {
				grid: { display: false },
				ticks: { color: '#78716c', maxRotation: 0, autoSkipPadding: 20 }
			},
			y: {
				beginAtZero: true,
				grid: { color: '#f5f5f4' },
				ticks: { color: '#78716c' }
			}
		}
	};

	const barOptions: ChartOptions<'bar'> = {
		...lineOptions,
		scales: {
			...lineOptions.scales,
			y: {
				...lineOptions.scales?.y,
				ticks: { color: '#78716c', precision: 0 }
			}
		}
	} as ChartOptions<'bar'>;

	const eggsChart = $derived({
		labels: eggLabels,
		datasets: [
			{
				label: 'Eggs collected',
				data: eggValues,
				borderColor: '#f59e0b',
				backgroundColor: 'rgba(245, 158, 11, 0.15)',
				borderWidth: 2,
				pointRadius: 0,
				pointHoverRadius: 4,
				tension: 0.35,
				fill: true
			}
		]
	});

	const feedChart = $derived({
		labels: feedLabels,
		datasets: [
			{
				label: 'Feed (kg)',
				data: feedValues,
				borderColor: '#10b981',
				backgroundColor: 'rgba(16, 185, 129, 0.15)',
				borderWidth: 2,
				pointRadius: 0,
				pointHoverRadius: 4,
				tension: 0.35,
				fill: true
			}
		]
	});

	const mortalityChart = $derived({
		labels: mortalityLabels,
		datasets: [
			{
				label: 'Deaths',
				data: mortalityValues,
				backgroundColor: 'rgba(244, 63, 94, 0.7)',
				borderColor: '#e11d48',
				borderWidth: 1,
				borderRadius: 4
			}
		]
	});
</script>

<svelte:head><title>Dashboard — Poultry ERP</title></svelte:head>

<section class="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
	<!-- Header -->
	<div class="mb-6">
		<p class="text-xs font-semibold uppercase tracking-widest text-amber-600">Dashboard</p>
		<h1 class="mt-2 text-3xl font-bold tracking-tight text-stone-900">Farm overview</h1>
		<p class="mt-2 text-sm text-stone-600">Live metrics across all active batches.</p>
	</div>

	<!-- ─── Main grid: sidebar + content ─── -->
	<div
		class="grid grid-cols-1 gap-6
			lg:grid-cols-[300px_minmax(0,1fr)]
			lg:h-[calc(100vh-11rem)]"
	>
		<!-- ─── KPI sidebar ─── -->
		<aside
			class="flex flex-col gap-4
				lg:min-h-0 lg:overflow-y-auto"
		>
			<div class="rounded-2xl border border-stone-200 bg-white p-4">
				<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Active batches</p>
				<p class="mt-1 text-2xl font-bold text-stone-900">{data.kpis.activeBatches}</p>
			</div>

			<div class="rounded-2xl border border-stone-200 bg-white p-4">
				<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Live birds</p>
				<p class="mt-1 text-2xl font-bold text-stone-900">{data.kpis.liveBirds}</p>
			</div>

			<div class="rounded-2xl border border-amber-200 bg-amber-50 p-4">
				<p class="text-xs font-semibold uppercase tracking-wider text-amber-700">Eggs today</p>
				<p class="mt-1 text-2xl font-bold text-amber-800">{data.kpis.eggsToday}</p>
			</div>

			<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
				<p class="text-xs font-semibold uppercase tracking-wider text-emerald-700">Feed this week</p>
				<p class="mt-1 text-2xl font-bold text-emerald-800">
					{kg(data.kpis.feedThisWeek)}
					<span class="text-base font-medium text-emerald-600">kg</span>
				</p>
			</div>

			<div class="rounded-2xl border border-rose-200 bg-rose-50 p-4">
				<p class="text-xs font-semibold uppercase tracking-wider text-rose-700">Deaths this week</p>
				<p class="mt-1 text-2xl font-bold text-rose-800">
					{data.kpis.deathsThisWeek}
					<span class="ml-2 text-xs font-medium text-rose-600">({data.kpis.mortalityRate}%)</span>
				</p>
			</div>
		</aside>

		<!-- ─── Right column: filter + charts ─── -->
		<div class="flex min-w-0 flex-col gap-4 lg:min-h-0">
			<!-- Filter bar — pinned at top of column -->
			<form
				class="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
				onsubmit={(e) => {
					e.preventDefault();
					applyFilter();
				}}
			>
				<div class="flex flex-wrap items-end gap-4">
					<fieldset class="flex items-center gap-1 rounded-xl bg-stone-100 p-1">
						<legend class="sr-only">Time range</legend>
						<label
							class="cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium transition
								{range === 'week'
								? 'bg-white text-stone-900 shadow-sm'
								: 'text-stone-600 hover:text-stone-900'}"
						>
							<input
								type="radio"
								name="range"
								value="week"
								bind:group={range}
								onchange={onRangeChange}
								class="sr-only"
							/>
							Week
						</label>
						<label
							class="cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium transition
								{range === 'month'
								? 'bg-white text-stone-900 shadow-sm'
								: 'text-stone-600 hover:text-stone-900'}"
						>
							<input
								type="radio"
								name="range"
								value="month"
								bind:group={range}
								onchange={onRangeChange}
								class="sr-only"
							/>
							Month
						</label>
					</fieldset>

					{#if range === 'week'}
						<div>
							<label for="week" class="mb-1 block text-xs font-medium text-stone-600">Week</label>
							<input
								id="week"
								type="week"
								bind:value={week}
								onchange={onRangeChange}
								class="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
							/>
						</div>
					{/if}

					{#if range === 'month'}
						<div>
							<label for="month" class="mb-1 block text-xs font-medium text-stone-600">Month</label>
							<input
								id="month"
								type="month"
								bind:value={month}
								onchange={onRangeChange}
								class="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
							/>
						</div>
					{/if}

					<p class="ml-auto text-xs text-stone-500">{rangeLabel()}</p>
				</div>
			</form>

			<!-- Charts column — scrolls internally on desktop -->
			<div class="relative flex-1 lg:min-h-0">
				<div class="flex flex-col gap-4 lg:h-full lg:overflow-y-auto lg:pr-1">
					<!-- Egg production -->
					<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
						<div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
							<div>
								<h2 class="text-base font-semibold text-stone-900">Egg production</h2>
								<p class="text-xs text-stone-500">{rangeLabel()}</p>
							</div>
							<p class="text-sm text-stone-600">
								Total:
								<span class="font-semibold text-amber-700">
									{eggValues.reduce((a, b) => a + b, 0)}
								</span>
							</p>
						</div>
						<div class="h-48">
							<Line data={eggsChart} options={lineOptions} />
						</div>
					</div>

					<!-- Feed consumption -->
					<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
						<div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
							<div>
								<h2 class="text-base font-semibold text-stone-900">Feed consumption</h2>
								<p class="text-xs text-stone-500">{rangeLabel()}</p>
							</div>
							<p class="text-sm text-stone-600">
								Total:
								<span class="font-semibold text-emerald-700">
									{feedValues.reduce((a, b) => a + b, 0).toFixed(1)} kg
								</span>
							</p>
						</div>
						<div class="h-48">
							<Line data={feedChart} options={lineOptions} />
						</div>
					</div>

					<!-- Mortalities -->
					<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
						<div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
							<div>
								<h2 class="text-base font-semibold text-stone-900">Mortalities</h2>
								<p class="text-xs text-stone-500">{rangeLabel()}</p>
							</div>
							<p class="text-sm text-stone-600">
								Total:
								<span class="font-semibold text-rose-700">
									{mortalityValues.reduce((a, b) => a + b, 0)}
								</span>
							</p>
						</div>
						<div class="h-48">
							<Bar data={mortalityChart} options={barOptions} />
						</div>
					</div>
				</div>

				<!-- Fade at bottom — hints at more content -->
				<div
					class="pointer-events-none absolute inset-x-0 bottom-0 hidden h-8 bg-gradient-to-t from-stone-50 to-transparent lg:block"
				></div>
			</div>
		</div>
	</div>
</section>
