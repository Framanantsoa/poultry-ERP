<script lang="ts">
	import type { PageProps } from './$types';
	import MortalityForm from '#lib/components/MortalityForm.svelte';
	import { formatLongDate, formatDateTime } from '#lib/utils/dates.ts';

	let { data, form }: PageProps = $props();

	let editing = $state(false);

	// Re-open the form if the server returned errors
	$effect(() => {
		if (form?.errors) editing = true;
	});
</script>

<svelte:head>
	<title>Mortality #{data.row.id} — Poultry ERP</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
	<a
		href="/reports/mortalities"
		class="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-600 transition hover:text-stone-900"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
		</svg>
		Back to mortalities
	</a>

	<div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
		{#if !editing}
			<!-- ─── View mode ─── -->
			<div class="flex items-start justify-between gap-4">
				<div>
					<h1 class="text-2xl font-bold tracking-tight text-stone-900">
                        {new Date(data.row.eventDate).toLocaleDateString(undefined, {
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

			<!-- Summary card -->
			<div class="mt-8 grid gap-4 sm:grid-cols-2">
				<div class="rounded-2xl border border-rose-200 bg-rose-50 p-4">
					<p class="text-xs font-semibold uppercase tracking-wider text-rose-700">Deaths</p>
					<p class="mt-1 text-3xl font-bold text-rose-800">{data.row.deaths}</p>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
					<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Cause</p>
					<p class="mt-1 text-lg font-semibold text-stone-900">{data.row.cause ?? '—'}</p>
				</div>
			</div>

			<!-- Details -->
			<dl class="mt-8 divide-y divide-stone-100 rounded-2xl border border-stone-100">
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
			<h1 class="text-2xl font-bold tracking-tight text-stone-900">Edit mortality record</h1>
			<p class="mt-1 text-sm text-stone-600">Update this mortality event.</p>

			<div class="mt-8">
				<MortalityForm
					action="?/update"
					batches={data.batches}
					values={form?.values ?? {
						batchId: data.row.batchId,
						eventDate: data.row.eventDate,
						deaths: data.row.deaths,
						cause: data.row.cause,
						notes: data.row.notes
					}}
					errors={form?.errors}
					submitLabel="Save changes"
					cancelHref="/reports/mortalities/{data.row.id}"
				/>
			</div>
		{/if}
	</div>
</div>
