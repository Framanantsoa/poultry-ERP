<script lang="ts">
	import { enhance } from '$app/forms';

	type Option = { id: number; name: string };

	type Values = {
		batchId?: number | string | null;
		productionDate?: string | null;
		eggsCollected?: number | string | null;
		eggsBroken?: number | string | null;
		eggsDiscarded?: number | string | null;
		totalWeightKg?: number | string | null;
		notes?: string | null;
	};

	type Errors = {
		batchId?: string[];
		productionDate?: string[];
		eggsCollected?: string[];
		eggsBroken?: string[];
		eggsDiscarded?: string[];
		totalWeightKg?: string[];
		notes?: string[];
	};

	type Props = {
		action?: string;
		submitLabel?: string;
		batches: Option[];
		values?: Values;
		errors?: Errors;
		message?: string;
		cancelHref?: string;
		existingId?: number | null;   // ← new
	};

	let {
		action = '',
		submitLabel = 'Save',
		batches,
		values = {},
		errors = {},
		message,
		cancelHref = '/reports/egg-productions',
		existingId = null
	}: Props = $props();

	const today = new Date().toISOString().slice(0, 10);

	let collected = $state<number | string>(values.eggsCollected ?? '');
	let broken = $state<number | string>(values.eggsBroken ?? 0);
	let discarded = $state<number | string>(values.eggsDiscarded ?? 0);

	const usable = $derived(
		Math.max(0, Number(collected || 0) - Number(broken || 0) - Number(discarded || 0))
	);
	const showPreview = $derived(Number(collected) > 0);
</script>

{#if message}
	<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
		{message}
	</div>
{/if}

<form method="POST" {action} use:enhance class="space-y-6">
	<!-- Batch + Date -->
	<div class="grid gap-6 sm:grid-cols-2">
		<div>
			<label for="batchId" class="block text-sm font-medium text-stone-700">
				Batch <span class="text-red-500">*</span>
			</label>
			<select
				id="batchId"
				name="batchId"
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
			>
				<option value="">— Select a batch —</option>
				{#each batches as b (b.id)}
					<option
						value={b.id}
						selected={values.batchId != null && String(values.batchId) === String(b.id)}
					>
						{b.name}
					</option>
				{/each}
			</select>
			{#if errors.batchId}<p class="mt-1.5 text-xs text-red-600">{errors.batchId[0]}</p>{/if}
		</div>

		<div>
			<label for="productionDate" class="block text-sm font-medium text-stone-700">
				Production date <span class="text-red-500">*</span>
			</label>
			<input
				id="productionDate"
				name="productionDate"
				type="date"
				value={values.productionDate ?? today}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20
					{errors.productionDate ? 'border-red-400 ring-2 ring-red-100' : ''}"
			/>
			{#if errors.productionDate}
				<p class="mt-1.5 text-xs text-red-600">{errors.productionDate[0]}</p>
			{/if}
		</div>
	</div>

	<!-- Counts -->
	<div class="grid gap-6 sm:grid-cols-3">
		<div>
			<label for="eggsCollected" class="block text-sm font-medium text-stone-700">
				Collected <span class="text-red-500">*</span>
			</label>
			<input
				id="eggsCollected"
				name="eggsCollected"
				type="number"
				min="0"
				step="1"
				bind:value={collected}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				placeholder="0"
			/>
			{#if errors.eggsCollected}<p class="mt-1.5 text-xs text-red-600">{errors.eggsCollected[0]}</p>{/if}
		</div>

		<div>
			<label for="eggsBroken" class="block text-sm font-medium text-stone-700">Broken</label>
			<input
				id="eggsBroken"
				name="eggsBroken"
				type="number"
				min="0"
				step="1"
				bind:value={broken}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				placeholder="0"
			/>
			{#if errors.eggsBroken}<p class="mt-1.5 text-xs text-red-600">{errors.eggsBroken[0]}</p>{/if}
		</div>

		<div>
			<label for="eggsDiscarded" class="block text-sm font-medium text-stone-700">Discarded</label>
			<input
				id="eggsDiscarded"
				name="eggsDiscarded"
				type="number"
				min="0"
				step="1"
				bind:value={discarded}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				placeholder="0"
			/>
			{#if errors.eggsDiscarded}<p class="mt-1.5 text-xs text-red-600">{errors.eggsDiscarded[0]}</p>{/if}
		</div>
	</div>

	<!-- Usable preview -->
	{#if showPreview}
		<div class="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
			<span class="text-sm font-medium text-emerald-800">Usable eggs</span>
			<span class="text-lg font-bold text-emerald-900">{usable}</span>
		</div>
	{/if}

	<!-- Weight -->
	<div class="grid gap-6 sm:grid-cols-2">
		<div>
			<label for="totalWeightKg" class="block text-sm font-medium text-stone-700">
				Total weight (kg) <span class="text-stone-400">— optional</span>
			</label>
			<input
				id="totalWeightKg"
				name="totalWeightKg"
				type="number"
				min="0"
				step="0.001"
				value={values.totalWeightKg ?? ''}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				placeholder="0.000"
			/>
			{#if errors.totalWeightKg}<p class="mt-1.5 text-xs text-red-600">{errors.totalWeightKg[0]}</p>{/if}
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
		<a
			href={cancelHref}
			class="rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
		>
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