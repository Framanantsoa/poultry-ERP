<script lang="ts">
	import { batchStatusValues } from '#lib/schemas/batch.ts';
	import { enhance } from '$app/forms';

	type Option = { id: number; name: string };

	type Values = {
		code?: string | null;
		name?: string | null;
		breedId?: number | string | null;
		initialCount?: number | string | null;
		arrivalDate?: string | null;
		notes?: string | null;
	};

	type Errors = {
		code?: string[];
		name?: string[];
		breedId?: string[];
		initialCount?: string[];
		arrivalDate?: string[];
		notes?: string[];
	};

	type Props = {
		action?: string;
		submitLabel?: string;
		breeds: Option[];
		values?: Values;
		errors?: Errors;
		message?: string;
	};

	let {
		action = '',
		submitLabel = 'Save',
		breeds,
		values = {},
		errors = {},
		message
	}: Props = $props();

	const today = new Date().toISOString().slice(0, 10);
</script>

{#if message}
	<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
		{message}
	</div>
{/if}

<form method="POST" {action} use:enhance class="space-y-6">
	<!-- Code + Name -->
	<div class="grid gap-6 sm:grid-cols-2">
		<div>
			<label for="code" class="block text-sm font-medium text-stone-700">
				Code <span class="text-red-500">*</span>
			</label>
			<input
				id="code"
				name="code"
				type="text"
				maxlength="40"
				value={values.code ?? ''}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				placeholder="B-2026-001"
			/>
			{#if errors.code}<p class="mt-1.5 text-xs text-red-600">{errors.code[0]}</p>{/if}
		</div>

		<div>
			<label for="name" class="block text-sm font-medium text-stone-700">
				Name <span class="text-red-500">*</span>
			</label>
			<input
				id="name"
				name="name"
				type="text"
				maxlength="120"
				value={values.name ?? ''}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				placeholder="Spring flock"
			/>
			{#if errors.name}<p class="mt-1.5 text-xs text-red-600">{errors.name[0]}</p>{/if}
		</div>
	</div>

	<!-- Breed + Count -->
	<div class="grid gap-6 sm:grid-cols-2">
		<div>
			<label for="breedId" class="block text-sm font-medium text-stone-700">
				Breed <span class="text-red-500">*</span>
			</label>
			<select
				id="breedId"
				name="breedId"
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
			>
				<option value="">— None —</option>
				{#each breeds as b (b.id)}
					<option value={b.id} selected={values.breedId != null && String(values.breedId) === String(b.id)}>
						{b.name}
					</option>
				{/each}
			</select>
			{#if errors.breedId}<p class="mt-1.5 text-xs text-red-600">{errors.breedId[0]}</p>{/if}
		</div>

		<div>
			<label for="initialCount" class="block text-sm font-medium text-stone-700">
				Initial count <span class="text-red-500">*</span>
			</label>
			<input
				id="initialCount"
				name="initialCount"
				type="number"
				min="1"
				step="1"
				value={values.initialCount ?? ''}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
			/>
			{#if errors.initialCount}<p class="mt-1.5 text-xs text-red-600">{errors.initialCount[0]}</p>{/if}
		</div>
	</div>

	<!-- Date -->
	<div class="grid gap-6 sm:grid-cols-2">
		<div>
			<label for="arrivalDate" class="block text-sm font-medium text-stone-700">
				Arrival date <span class="text-red-500">*</span>
			</label>
			<input
				id="arrivalDate"
				name="arrivalDate"
				type="date"
				value={values.arrivalDate ?? today}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
			/>
			{#if errors.arrivalDate}<p class="mt-1.5 text-xs text-red-600">{errors.arrivalDate[0]}</p>{/if}
		</div>
	</div>

	<!-- Notes -->
	<div>
		<label for="notes" class="block text-sm font-medium text-stone-700">Notes</label>
		<textarea
			id="notes"
			name="notes"
			rows="4"
			maxlength="2000"
			class="mt-1.5 w-full resize-none rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
			placeholder="Optional notes"
		>{values.notes ?? ''}</textarea>
		{#if errors.notes}<p class="mt-1.5 text-xs text-red-600">{errors.notes[0]}</p>{/if}
	</div>

	<!-- Actions -->
	<div class="flex items-center justify-end gap-3 border-t border-stone-100 pt-6">
		<a href="/batches" class="rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100">
			Cancel
		</a>
		<button
			type="submit"
			class="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-amber-400"
		>
			{submitLabel}
		</button>
	</div>
</form>
