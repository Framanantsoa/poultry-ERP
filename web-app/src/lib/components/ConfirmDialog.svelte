<script lang="ts">
	type Props = {
		open: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'danger' | 'default';
		loading?: boolean;
		onconfirm: () => void;
		oncancel: () => void;
	};

	let {
		open,
		title = 'Are you sure?',
		message = 'This action cannot be undone.',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		variant = 'danger',
		loading = false,
		onconfirm,
		oncancel
	}: Props = $props();

	function onKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') oncancel();
	}

	$effect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});
</script>

<svelte:window on:keydown={onKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-title"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="absolute inset-0 cursor-default bg-stone-900/40 backdrop-blur-sm"
			onclick={oncancel}
			aria-label="Close dialog"
		></button>

		<!-- Panel -->
		<div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start gap-4">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full
						{variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
					</svg>
				</div>

				<div class="flex-1">
					<h2 id="confirm-title" class="text-base font-semibold text-stone-900">{title}</h2>
					<p class="mt-1 text-sm text-stone-600">{message}</p>
				</div>
			</div>

			<div class="mt-6 flex justify-end gap-3">
				<button
					type="button"
					onclick={oncancel}
					disabled={loading}
					class="rounded-xl px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
				>
					{cancelLabel}
				</button>
				<button
					type="button"
					onclick={onconfirm}
					disabled={loading}
					class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50
						{variant === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-500 hover:bg-amber-400 text-stone-900'}"
				>
					{loading ? 'Deleting…' : confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
