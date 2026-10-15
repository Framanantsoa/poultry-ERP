<script lang="ts">
	import type { PageProps } from './$types';
	import BatchForm from '#lib/components/BatchForm.svelte';
	import type { BatchFormResult } from '#lib/types/form.ts';

	let { data, form }: PageProps = $props();

	const f = $derived(form as BatchFormResult | null);

	const values = $derived({
		code: f?.values?.code ?? data.batch.code,
		name: f?.values?.name ?? data.batch.name,
		breedId: f?.values?.breedId ?? data.batch.breedId ?? '',
		initialCount: f?.values?.initialCount ?? data.batch.initialCount,
		arrivalDate: f?.values?.arrivalDate ?? data.batch.arrivalDate,
		notes: f?.values?.notes ?? data.batch.notes ?? ''
	});
</script>

<svelte:head>
	<title>Edit {data.batch.name} — Poultry ERP</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
	<a href="/batches" class="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-600 transition hover:text-stone-900">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
		</svg>
		Back to batches
	</a>

	<div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
		<h1 class="text-2xl font-bold tracking-tight text-stone-900">Edit batch</h1>
		<p class="mt-1 text-sm text-stone-600">Update details for {data.batch.code}.</p>

		<div class="mt-8">
			<BatchForm
				breeds={data.breeds}
				{values}
				errors={f?.errors}
				message={f?.message}
				submitLabel="Save changes"
			/>
		</div>
	</div>
</div>
