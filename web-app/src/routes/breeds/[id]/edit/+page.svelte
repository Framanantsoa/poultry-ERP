<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: PageProps = $props();

	// Prefer the submitted values (on validation error), fall back to loaded breed
	const name = $derived(form?.values?.name ?? data.breed.name);
	const notes = $derived(form?.values?.notes ?? data.breed.notes ?? '');
</script>

<svelte:head>
	<title>Edit {data.breed.name} — Poultry ERP</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
	<a
		href="/breeds"
		class="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-600 transition hover:text-stone-900"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
		</svg>
		Back to breeds
	</a>

	<div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
		<h1 class="text-2xl font-bold tracking-tight text-stone-900">Edit breed</h1>
		<p class="mt-1 text-sm text-stone-600">Update the breed details below.</p>

		{#if form?.message}
			<div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
				{form.message}
			</div>
		{/if}

		<form method="POST" use:enhance class="mt-8 space-y-6">
			<div>
				<label for="name" class="block text-sm font-medium text-stone-700">
					Name <span class="text-red-500">*</span>
				</label>
				<input
					id="name"
					name="name"
					type="text"
					maxlength="120"
					value={name}
					class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				/>
				{#if form?.errors?.name}
					<p class="mt-1.5 text-xs text-red-600">{form.errors.name[0]}</p>
				{/if}
			</div>

			<div>
				<label for="notes" class="block text-sm font-medium text-stone-700">Notes</label>
				<textarea
					id="notes"
					name="notes"
					rows="4"
					maxlength="1000"
					class="mt-1.5 w-full resize-none rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				>{notes}</textarea>
				{#if form?.errors?.notes}
					<p class="mt-1.5 text-xs text-red-600">{form.errors.notes[0]}</p>
				{/if}
			</div>

			<div class="flex items-center justify-end gap-3 border-t border-stone-100 pt-6">
				<a
					href="/breeds"
					class="rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
				>
					Cancel
				</a>
				<button
					type="submit"
					class="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-amber-400"
				>
					Save changes
				</button>
			</div>
		</form>
	</div>
</div>
