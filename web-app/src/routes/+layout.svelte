<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';

	let { children }: LayoutProps = $props();

	const navItems = [
		{ href: '/', label: 'Home', icon: 'home' },
		{ href: '/dashboard', label: 'Dashboard', icon: 'home' },
		{ href: '/batches', label: 'Batches', icon: 'batch' },
		{ href: '/breeds', label: 'Breeds', icon: 'breed' },
		{ href: '/reports', label: 'Reports', icon: 'report' }
	];

	let mobileOpen = $state(false);

	function isActive(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="min-h-screen bg-stone-50 flex flex-col">
	<!-- ─── Top Bar ─────────────────────────────────────────── -->
	<header
		class="sticky top-0 z-40 border-b border-stone-200/70 bg-white/85 backdrop-blur-md"
	>
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-2.5 group">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm transition-transform group-hover:scale-105"
				>
					<span class="text-lg">🐓</span>
				</div>
				<div class="leading-tight">
					<div class="text-sm font-semibold text-stone-900">Poultry ERP</div>
					<div class="text-[10px] uppercase tracking-wider text-stone-500">Farm Manager</div>
				</div>
			</a>

			<!-- Desktop nav -->
			<nav class="hidden md:flex items-center gap-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="rounded-lg px-3 py-2 text-sm font-medium transition-colors
							{isActive(item.href)
							? 'bg-amber-50 text-amber-700'
							: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}"
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<!-- Right side -->
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
					Synced
				</button>

				<!-- Mobile menu toggle -->
				<button
					type="button"
					onclick={() => (mobileOpen = !mobileOpen)}
					class="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
					aria-label="Toggle menu"
					aria-expanded={mobileOpen}
				>
					{#if mobileOpen}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile nav -->
		{#if mobileOpen}
			<div class="md:hidden border-t border-stone-200 bg-white">
				<nav class="mx-auto max-w-7xl space-y-1 px-4 py-3">
					{#each navItems as item}
						<a
							href={item.href}
							onclick={() => (mobileOpen = false)}
							class="block rounded-lg px-3 py-2 text-sm font-medium
								{isActive(item.href)
								? 'bg-amber-50 text-amber-700'
								: 'text-stone-700 hover:bg-stone-100'}"
						>
							{item.label}
						</a>
					{/each}
				</nav>
			</div>
		{/if}
	</header>

	<!-- ─── Main ─────────────────────────────────────────────── -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- ─── Footer ──────────────────────────────────────────── -->
	<footer class="border-t border-stone-200 bg-white">
		<div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
			<p class="text-xs text-stone-500">
				© {new Date().getFullYear()} Poultry ERP · Built with SvelteKit
			</p>
			<p class="text-xs text-stone-400">
				<span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle"></span>
				<span class="ml-1.5">All systems operational</span>
			</p>
		</div>
	</footer>
</div>
