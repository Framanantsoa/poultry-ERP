<script lang="ts">
	import type { PageProps } from './$types';
	import MortalityForm from '#lib/components/MortalityForm.svelte';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>New mortality — Poultry ERP</title>
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
		<h1 class="text-2xl font-bold tracking-tight text-stone-900">Record mortality</h1>
		<p class="mt-1 text-sm text-stone-600">Log a mortality event for a batch.</p>

		<div class="mt-8">
			<MortalityForm
				batches={data.batches}
				values={form?.values}
				errors={form?.errors}
				submitLabel="Save entry"
			/>
		</div>
	</div>
</div>
