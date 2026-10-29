<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';

	let { data, form }: PageProps = $props();

	// Target breed selected for deletion
	let target = $state<{ id: number; name: string; batchCount: number } | null>(null);
	let submitting = $state(false);

	// Bound form refs, one per row
	let formRefs = $state<Record<number, HTMLFormElement | null>>({});

	function askDelete(breed: { id: number; name: string; batchCount: number }) {
		target = breed;
	}

	function cancelDelete() {
		target = null;
	}

	function confirmDelete() {
		if (!target) return;
		const el = formRefs[target.id];
		if (!el) return;
		submitting = true;
		el.requestSubmit();
	}
</script>

<svelte:head>
	<title>Breeds — Poultry ERP</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-stone-900">Breeds</h1>
			<p class="mt-1 text-sm text-stone-600">
				Reference list of poultry breeds used across your batches.
			</p>
		</div>
		<a
			href="/breeds/new"
			class="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-amber-400"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			New breed
		</a>
	</div>

	<!-- Error banner -->
	{#if form?.message}
		<div class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			{form.message}
		</div>
	{/if}

	<!-- Empty state -->
	{#if data.breeds.length === 0}
		<div class="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
			<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl">
				🐔
			</div>
			<h2 class="text-base font-semibold text-stone-900">No breeds yet</h2>
			<p class="mt-1 text-sm text-stone-600">Create your first breed to start assigning them to batches.</p>
			<a
				href="/breeds/new"
				class="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-amber-400"
			>
				Create a breed
			</a>
		</div>
	{:else}
		<!-- Table -->
		<div class="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
			<table class="w-full text-left text-sm">
				<thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
					<tr>
						<th class="px-5 py-3 font-medium">Name</th>
						<th class="hidden px-5 py-3 font-medium sm:table-cell">Notes</th>
						<th class="px-5 py-3 font-medium text-center">Batches</th>
						<th class="px-5 py-3 font-medium text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-stone-100">
					{#each data.breeds as breed (breed.id)}
						<tr class="transition hover:bg-stone-50/60">
							<td class="px-5 py-4 font-medium text-stone-900">{breed.name}</td>
							<td class="hidden px-5 py-4 text-stone-600 sm:table-cell">
								{breed.notes ?? '—'}
							</td>
							<td class="px-5 py-4 text-center">
								<span class="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">
									{breed.batchCount}
								</span>
							</td>
							<td class="px-5 py-4 text-right">
								<div class="inline-flex gap-2">
									<a
										href="/breeds/{breed.id}/edit"
										class="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
									>
										Edit
									</a>

									<form
										method="POST"
										action="?/delete"
										bind:this={formRefs[breed.id]}
										use:enhance={() => {
											return async ({ update }) => {
												submitting = false;
												target = null;
												await update();
											};
										}}
									>
										<input type="hidden" name="id" value={breed.id} />
										<button
											type="button"
											onclick={() =>
												askDelete({
													id: breed.id,
													name: breed.name,
													batchCount: breed.batchCount
												})}
											class="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
										>
											Delete
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Confirmation dialog -->
<ConfirmDialog
	open={target !== null}
	title="Delete breed?"
	message={target
		? target.batchCount > 0
			? `"${target.name}" is used by ${target.batchCount} batch${target.batchCount === 1 ? '' : 'es'}. It will be archived from new assignments, but existing batches will keep their reference.`
			: `"${target.name}" will be archived. You can restore it later if needed.`
		: ''}
	confirmLabel="Delete breed"
	variant="danger"
	loading={submitting}
	onconfirm={confirmDelete}
	oncancel={cancelDelete}
/>