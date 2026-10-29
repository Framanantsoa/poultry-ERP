<script lang="ts">
	import { enhance } from '$app/forms';

	type Option = { id: number; name: string };

	type Values = {
		batchId?: number | string | null;
		consumptionDate?: string | null;
		quantityKg?: number | string | null;
		feedType?: string | null;
		costPerKg?: number | string | null;
		notes?: string | null;
	};

	type Errors = {
		batchId?: string[];
		consumptionDate?: string[];
		quantityKg?: string[];
		feedType?: string[];
		costPerKg?: string[];
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
		existingId?: number | null;
	};

	let {
		action = '',
		submitLabel = 'Save',
		batches,
		values = {},
		errors = {},
		message,
		cancelHref = '/reports/feed-consumption',
		existingId = null
	}: Props = $props();

	const today = new Date().toISOString().slice(0, 10);

	// Live total-cost preview
	let quantity = $state<number | string>(values.quantityKg ?? '');
	let costPerKg = $state<number | string>(values.costPerKg ?? '');

	const totalCost = $derived(
		Number(quantity || 0) * Number(costPerKg || 0)
	);
	const showPreview = $derived(
		Number(quantity) > 0 && Number(costPerKg) > 0
	);
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
			<label for="consumptionDate" class="block text-sm font-medium text-stone-700">
				Consumption date <span class="text-red-500">*</span>
			</label>
			<input
				id="consumptionDate"
				name="consumptionDate"
				type="date"
				value={values.consumptionDate ?? today}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20
					{errors.consumptionDate ? 'border-red-400 ring-2 ring-red-100' : ''}"
			/>
			{#if errors.consumptionDate}
				<p class="mt-1.5 text-xs text-red-600">{errors.consumptionDate[0]}</p>
				{#if existingId}
					<a
						href={`/reports/feed-consumption/${existingId}`}
						class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
					>
						→ Open the existing entry (#{existingId})
					</a>
				{/if}
			{/if}
		</div>
	</div>

	<!-- Quantity + cost per kg -->
	<div class="grid gap-6 sm:grid-cols-2">
		<div>
			<label for="quantityKg" class="block text-sm font-medium text-stone-700">
				Quantity (kg) <span class="text-red-500">*</span>
			</label>
			<input
				id="quantityKg"
				name="quantityKg"
				type="number"
				min="0.001"
				step="0.001"
				bind:value={quantity}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				placeholder="0.000"
			/>
			{#if errors.quantityKg}<p class="mt-1.5 text-xs text-red-600">{errors.quantityKg[0]}</p>{/if}
		</div>

		<div>
			<label for="costPerKg" class="block text-sm font-medium text-stone-700">
				Cost per kg <span class="text-stone-400">— optional</span>
			</label>
			<input
				id="costPerKg"
				name="costPerKg"
				type="number"
				min="0"
				step="0.0001"
				bind:value={costPerKg}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				placeholder="0.0000"
			/>
			{#if errors.costPerKg}<p class="mt-1.5 text-xs text-red-600">{errors.costPerKg[0]}</p>{/if}
		</div>
	</div>

	<!-- Total cost preview -->
	{#if showPreview}
		<div class="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
			<span class="text-sm font-medium text-emerald-800">Estimated total cost</span>
			<span class="text-lg font-bold text-emerald-900">{totalCost.toFixed(2)}</span>
		</div>
	{/if}

	<!-- Feed type -->
	<div>
		<label for="feedType" class="block text-sm font-medium text-stone-700">
			Feed type <span class="text-stone-400">— optional</span>
		</label>
		<input
			id="feedType"
			name="feedType"
			type="text"
			maxlength="120"
			value={values.feedType ?? ''}
			class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
			placeholder="e.g. Layer mash, brand name"
		/>
		{#if errors.feedType}<p class="mt-1.5 text-xs text-red-600">{errors.feedType[0]}</p>{/if}
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
