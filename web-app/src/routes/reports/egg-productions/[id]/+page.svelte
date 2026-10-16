<script lang="ts">
	import type { PageProps } from './$types';
	import EggProductionForm from '#lib/components/EggProductionForm.svelte';
	import { formatDateTime } from '#lib/utils/dates.ts';

	let { data, form }: PageProps = $props();

	let editing = $state(false);

	// Re-open the form if the server returned errors
	$effect(() => {
		if (form?.errors) editing = true;
	});

	function fmtDateTime(d: string | Date) {
		return new Date(d).toLocaleString();
	}

	const usable = $derived(
		data.row.eggsCollected - data.row.eggsBroken - data.row.eggsDiscarded
	);
</script>

<svelte:head>
	<title>Production #{data.row.id} — Poultry ERP</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
	<a
		href="/reports/egg-productions"
		class="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-600 transition hover:text-stone-900"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
		</svg>
		Back to egg productions
	</a>

	{#if form?.success && !editing}
		<div class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
			Production updated.
		</div>
	{/if}

	<div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
		{#if !editing}
			<!-- ─── View mode ─── -->
			<div class="flex items-start justify-between gap-4">
				<div>
					<h1 class="text-2xl font-bold tracking-tight text-stone-900">
						{new Date(data.row.productionDate).toLocaleDateString(undefined, {
							year: 'numeric', month: 'long', day: 'numeric'
						})}
					</h1>
					<p class="mt-1 text-sm text-stone-600">
						Batch:
						<span class="font-medium text-stone-800">
							{data.row.batchName ?? `#${data.row.batchId}`}
						</span>
					</p>
				</div>
				<button
					type="button"
					onclick={() => (editing = true)}
					class="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
				>
					Edit
				</button>
			</div>

			<!-- Summary cards -->
			<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
					<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Collected</p>
					<p class="mt-1 text-2xl font-bold text-stone-900">{data.row.eggsCollected}</p>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
					<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Broken</p>
					<p class="mt-1 text-2xl font-bold text-amber-700">{data.row.eggsBroken}</p>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
					<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Discarded</p>
					<p class="mt-1 text-2xl font-bold text-rose-700">{data.row.eggsDiscarded}</p>
				</div>
				<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
					<p class="text-xs font-semibold uppercase tracking-wider text-emerald-700">Usable</p>
					<p class="mt-1 text-2xl font-bold text-emerald-800">{usable}</p>
				</div>
			</div>

			<!-- Details -->
			<dl class="mt-8 divide-y divide-stone-100 rounded-2xl border border-stone-100">
				<div class="grid grid-cols-3 gap-4 px-4 py-3">
					<dt class="text-sm text-stone-500">Weight</dt>
					<dd class="col-span-2 text-sm text-stone-900">
						{data.row.totalWeightKg ? `${data.row.totalWeightKg} kg` : '—'}
					</dd>
				</div>
				<div class="grid grid-cols-3 gap-4 px-4 py-3">
					<dt class="text-sm text-stone-500">Source</dt>
					<dd class="col-span-2 text-sm text-stone-900">{data.row.source}</dd>
				</div>
				<div class="grid grid-cols-3 gap-4 px-4 py-3">
					<dt class="text-sm text-stone-500">Notes</dt>
					<dd class="col-span-2 whitespace-pre-wrap text-sm text-stone-900">
						{data.row.notes ?? '—'}
					</dd>
				</div>
				<div class="grid grid-cols-3 gap-4 px-4 py-3">
					<dt class="text-sm text-stone-500">Created</dt>
					<dd class="col-span-2 text-sm text-stone-900">{formatDateTime(data.row.createdAt)}</dd>
				</div>
				<div class="grid grid-cols-3 gap-4 px-4 py-3">
					<dt class="text-sm text-stone-500">Updated</dt>
					<dd class="col-span-2 text-sm text-stone-900">{formatDateTime(data.row.updatedAt)}</dd>
				</div>
			</dl>
		{:else}
			<!-- ─── Edit mode ─── -->
			<h1 class="text-2xl font-bold tracking-tight text-stone-900">Edit production</h1>
			<p class="mt-1 text-sm text-stone-600">Update this egg collection entry.</p>

			<div class="mt-8">
				<EggProductionForm
					action="?/update"
					batches={data.batches}
					values={form?.values ?? {
						batchId: data.row.batchId,
						productionDate: data.row.productionDate,
						eggsCollected: data.row.eggsCollected,
						eggsBroken: data.row.eggsBroken,
						eggsDiscarded: data.row.eggsDiscarded,
						totalWeightKg: data.row.totalWeightKg,
						notes: data.row.notes
					}}
					errors={form?.errors}
					submitLabel="Save changes"
					cancelHref="/reports/egg-productions/{data.row.id}"
				/>
			</div>
		{/if}
	</div>
</div>
