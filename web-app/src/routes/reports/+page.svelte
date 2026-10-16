<script lang="ts">
	const cards = [
		{
			href: '/reports/egg-productions',
			icon: '🥚',
			title: 'Egg Production',
			desc: 'Daily collection totals, quality grades, and lay rate trends across batches.',
			accent: 'from-amber-400 to-orange-500',
			ring: 'hover:border-amber-300 hover:shadow-amber-500/10'
		},
		{
			href: '/reports/feed-consumptions',
			icon: '🌾',
			title: 'Feed Consumption',
			desc: 'Feed usage per batch, conversion ratios, and cost per bird over time.',
			accent: 'from-emerald-400 to-teal-500',
			ring: 'hover:border-emerald-300 hover:shadow-emerald-500/10'
		},
		{
			href: '/reports/mortalities',
			icon: '📉',
			title: 'Mortalities',
			desc: 'Mortality counts, causes, and rates compared across active batches.',
			accent: 'from-rose-400 to-red-500',
			ring: 'hover:border-rose-300 hover:shadow-rose-500/10'
		}
	];
</script>

<svelte:head>
	<title>Reports — Poultry ERP</title>
	<meta name="description" content="Egg production, feed consumption, and mortality reports." />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-10">
		<p class="text-xs font-semibold uppercase tracking-widest text-amber-600">Reports</p>
		<h1 class="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
			Farm insights
		</h1>
		<p class="mt-3 max-w-2xl text-base leading-relaxed text-stone-600">
			Choose a report to drill into production, feed, or mortality data across your batches.
		</p>
	</div>

	<!-- Cards -->
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each cards as card}
			<a
				href={card.href}
				class="group relative flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition
					hover:-translate-y-0.5 hover:shadow-md {card.ring}"
			>
				<!-- Icon -->
				<div
					class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br {card.accent} text-2xl shadow-sm transition-transform group-hover:scale-105"
				>
					<span>{card.icon}</span>
				</div>

				<!-- Text -->
				<h2 class="text-lg font-semibold text-stone-900">{card.title}</h2>
				<p class="mt-2 text-sm leading-relaxed text-stone-600">{card.desc}</p>

				<!-- Footer link -->
				<div class="mt-6 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition group-hover:text-stone-900">
					<span>View report</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</div>
			</a>
		{/each}
	</div>
</section>