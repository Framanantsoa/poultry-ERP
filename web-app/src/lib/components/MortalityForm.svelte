<script lang="ts">
	import { enhance } from '$app/forms';

	type Option = { id: number; name: string };

	type Values = {
		batchId?: number | string | null;
		eventDate?: string | null;
		deaths?: number | string | null;
		cause?: string | null;
		notes?: string | null;
	};

	type Errors = {
		batchId?: string[];
		eventDate?: string[];
		deaths?: string[];
		cause?: string[];
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
		cancelHref = '/reports/mortalities',
		existingId = null
	}: Props = $props();

	const today = new Date().toISOString().slice(0, 10);
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
			<label for="eventDate" class="block text-sm font-medium text-stone-700">
				Event date <span class="text-red-500">*</span>
			</label>
			<input
				id="eventDate"
				name="eventDate"
				type="date"
				value={values.eventDate ?? today}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20
					{errors.eventDate ? 'border-red-400 ring-2 ring-red-100' : ''}"
			/>
			{#if errors.eventDate}
				<p class="mt-1.5 text-xs text-red-600">{errors.eventDate[0]}</p>
				{#if existingId}
					<a
						href={`/reports/mortalities/${existingId}`}
						class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
					>
						→ Open the existing entry (#{existingId})
					</a>
				{/if}
			{/if}
		</div>
	</div>

	<!-- Deaths + Cause -->
	<div class="grid gap-6 sm:grid-cols-2">
		<div>
			<label for="deaths" class="block text-sm font-medium text-stone-700">
				Deaths <span class="text-red-500">*</span>
			</label>
			<input
				id="deaths"
				name="deaths"
				type="number"
				step="1"
				value={values.deaths ?? ''}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				placeholder="0"
			/>
			{#if errors.deaths}<p class="mt-1.5 text-xs text-red-600">{errors.deaths[0]}</p>{/if}
		</div>

		<div>
			<label for="cause" class="block text-sm font-medium text-stone-700">
				Cause <span class="text-stone-400">— optional</span>
			</label>
			<input
				id="cause"
				name="cause"
				type="text"
				maxlength="250"
				value={values.cause ?? ''}
				class="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
				placeholder="e.g. Heat stress, disease, predator"
			/>
			{#if errors.cause}<p class="mt-1.5 text-xs text-red-600">{errors.cause[0]}</p>{/if}
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
