<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function fmt(date: string | Date) {
		return new Date(date).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	const usableTotal = $derived(
		data.totals.collected - data.totals.broken - data.totals.discarded
	);

	// Build a page link preserving current filters
	function pageHref(p: number) {
		const params = new URLSearchParams();
		if (data.filters.batchId) params.set('batchId', String(data.filters.batchId));
		if (data.filters.from) params.set('from', data.filters.from);
		if (data.filters.to) params.set('to', data.filters.to);
		if (p > 1) params.set('page', String(p));
		const qs = params.toString();
		return `/reports/egg-productions${qs ? `?${qs}` : ''}`;
	}
</script>

<svelte:head><title>Egg Productions — Poultry ERP</title></svelte:head>

<section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
	<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
		<div>
			<a href="/reports" class="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-600 transition hover:text-stone-900">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to reports
            </a>
			<h1 class="mt-2 text-3xl font-bold tracking-tight text-stone-900">Egg Productions</h1>
			<p class="mt-2 text-sm text-stone-600">
				{data.total} {data.total === 1 ? 'entry' : 'entries'} · page {data.page} of {data.totalPages}
			</p>
		</div>
		<a
			href="/reports/egg-productions/new"
			class="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-amber-400"
		>
			+ New production
		</a>
	</div>

	<!-- Totals -->
	<div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-2xl border border-stone-200 bg-white p-4">
			<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Collected</p>
			<p class="mt-1 text-2xl font-bold text-stone-900">{data.totals.collected}</p>
		</div>
		<div class="rounded-2xl border border-stone-200 bg-white p-4">
			<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Broken</p>
			<p class="mt-1 text-2xl font-bold text-amber-700">{data.totals.broken}</p>
		</div>
		<div class="rounded-2xl border border-stone-200 bg-white p-4">
			<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Discarded</p>
			<p class="mt-1 text-2xl font-bold text-rose-700">{data.totals.discarded}</p>
		</div>
		<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
			<p class="text-xs font-semibold uppercase tracking-wider text-emerald-700">Usable</p>
			<p class="mt-1 text-2xl font-bold text-emerald-800">{usableTotal}</p>
		</div>
	</div>

	{#if data.rows.length === 0}
		<div class="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
			<p class="text-4xl">🥚</p>
			<h2 class="mt-3 text-lg font-semibold text-stone-900">No productions yet</h2>
			<p class="mt-1 text-sm text-stone-600">Record your first day of egg collection to get started.</p>
			<a
				href="/reports/egg-productions/new"
				class="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-amber-400"
			>
				Record production
			</a>
		</div>
	{:else}
		<div class="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
			<table class="min-w-full divide-y divide-stone-200">
				<thead class="bg-stone-50">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Date</th>
						<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Batch</th>
						<th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">Collected</th>
						<th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">Broken</th>
						<th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">Discarded</th>
						<th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">Usable</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-stone-100">
					{#each data.rows as row (row.id)}
						<tr class="transition hover:bg-stone-50">
							<td class="whitespace-nowrap px-4 py-3 text-sm text-stone-700">{fmt(row.productionDate)}</td>
							<td class="px-4 py-3 text-sm text-stone-700">{row.batchName ?? `#${row.batchId}`}</td>
							<td class="px-4 py-3 text-right text-sm font-medium text-stone-900">{row.eggsCollected}</td>
							<td class="px-4 py-3 text-right text-sm text-stone-600">{row.eggsBroken}</td>
							<td class="px-4 py-3 text-right text-sm text-stone-600">{row.eggsDiscarded}</td>
							<td class="px-4 py-3 text-right text-sm font-semibold text-emerald-700">
								{row.eggsCollected - row.eggsBroken - row.eggsDiscarded}
							</td>
							<td class="px-4 py-3 text-right">
								<a
									href={`/reports/egg-productions/${row.id}`}
									class="text-sm font-medium text-amber-600 hover:text-amber-700"
								>
									View
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if data.totalPages > 1}
			<div class="mt-6 flex items-center justify-between">
				<p class="text-sm text-stone-600">
					Page {data.page} of {data.totalPages}
				</p>
				<div class="flex items-center gap-2">
					<a
						href={pageHref(data.page - 1)}
						aria-disabled={data.page <= 1}
						class="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50
							{data.page <= 1 ? 'pointer-events-none opacity-50' : ''}"
					>
						Previous
					</a>
					<a
						href={pageHref(data.page + 1)}
						aria-disabled={data.page >= data.totalPages}
						class="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50
							{data.page >= data.totalPages ? 'pointer-events-none opacity-50' : ''}"
					>
						Next
					</a>
				</div>
			</div>
		{/if}
	{/if}
</section>
