<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const filters = [
		{ key: 'all', label: 'All' },
		{ key: 'active', label: 'Active' },
		{ key: 'completed', label: 'Completed' },
		{ key: 'archived', label: 'Archived' }
	];

	function statusBadgeClass(status: string) {
		switch (status) {
			case 'active':
				return 'bg-emerald-50 text-emerald-700';
			case 'completed':
				return 'bg-blue-50 text-blue-700';
			case 'archived':
				return 'bg-stone-100 text-stone-600';
			default:
				return 'bg-stone-100 text-stone-600';
		}
	}
</script>

<svelte:head>
	<title>Batches — Poultry ERP</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-stone-900">Batches</h1>
			<p class="mt-1 text-sm text-stone-600">Manage your poultry flocks from arrival to completion.</p>
		</div>
		<a
			href="/batches/new"
			class="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-amber-400"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			New batch
		</a>
	</div>

	<!-- Filters -->
	<div class="mb-6 flex flex-wrap gap-2">
		{#each filters as f}
			<a
				href={f.key === 'all' ? '/batches' : `/batches?status=${f.key}`}
				class="rounded-lg px-3 py-1.5 text-xs font-medium transition
					{data.status === f.key
					? 'bg-stone-900 text-white'
					: 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}"
			>
				{f.label}
			</a>
		{/each}
	</div>

	<!-- Empty state -->
	{#if data.batches.length === 0}
		<div class="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
			<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl">🐓</div>
			<h2 class="text-base font-semibold text-stone-900">No batches yet</h2>
			<p class="mt-1 text-sm text-stone-600">Create your first batch to start tracking production.</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
			<table class="w-full text-left text-sm">
				<thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
					<tr>
						<th class="px-5 py-3 font-medium">Code</th>
						<th class="px-5 py-3 font-medium">Name</th>
						<th class="hidden px-5 py-3 font-medium sm:table-cell">Breed</th>
						<th class="px-5 py-3 font-medium text-center">Birds</th>
						<th class="hidden px-5 py-3 font-medium md:table-cell">Arrival</th>
						<th class="px-5 py-3 font-medium">Status</th>
						<th class="px-5 py-3 font-medium text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-stone-100">
					{#each data.batches as b (b.id)}
						<tr class="transition hover:bg-stone-50/60">
							<td class="px-5 py-4 font-mono text-xs text-stone-600">{b.code}</td>
							<td class="px-5 py-4 font-medium text-stone-900">
								<a href="/batches/{b.id}/edit" class="hover:text-amber-600 transition">{b.name}</a>
							</td>
							<td class="hidden px-5 py-4 text-stone-600 sm:table-cell">{b.breedName ?? '—'}</td>
							<td class="px-5 py-4 text-center text-stone-700">
								<span class="font-medium">{b.currentCount}</span>
								<span class="text-stone-400">/ {b.initialCount}</span>
							</td>
							<td class="hidden px-5 py-4 text-stone-600 md:table-cell">{b.arrivalDate}</td>
							<td class="px-5 py-4">
								<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeClass(b.status)}">
									{b.status}
								</span>
							</td>
							<td class="px-5 py-4 text-right">
								<div class="inline-flex gap-2">
									<a href="/batches/{b.id}/edit"
										class="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
									>
										Edit
									</a>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
