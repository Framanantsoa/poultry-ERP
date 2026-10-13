<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — Poultry ERP</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
	<div class="max-w-md text-center">
		<div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
			{#if page.status === 404}🐣{:else}⚠️{/if}
		</div>
		<p class="text-6xl font-bold tracking-tight text-stone-900">{page.status}</p>
		<h1 class="mt-2 text-lg font-semibold text-stone-800">{page.error?.message ?? 'Something went wrong'}</h1>
		<p class="mt-2 text-sm text-stone-600">
			{#if page.status === 404}
				We couldn't find the page you were looking for.
			{:else}
				An unexpected error occurred. Please try again.
			{/if}
		</p>
		<div class="mt-8 flex justify-center gap-3">
			<a
				href="/"
				class="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-amber-400"
			>
				Back to home
			</a>
		</div>
	</div>
</div>
