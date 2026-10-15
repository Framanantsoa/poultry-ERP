<script lang="ts">
	// Hero carousel
	const slides = [
		{
			image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1600&q=80',
			eyebrow: 'Farm Management',
			title: 'Every flock, every egg, every day.',
			subtitle: 'Track production, feed, and mortality from one elegant dashboard.'
		},
		{
			image: 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?w=1600&q=80',
			eyebrow: 'Real-time Insights',
			title: null,
			subtitle: 'Live metrics across all active batches without spreadsheets.'
		},
		{
			image: 'https://images.pexels.com/photos/7782056/pexels-photo-7782056.jpeg',
			eyebrow: 'Built for Farmers',
			title: 'Less bookkeeping. More farming.',
			subtitle: 'Record a day of production in seconds, from phone or desktop.'
		}
	];

	let current = $state(0);
	let paused = $state(false);

	$effect(() => {
		if (paused) return;
		const id = setInterval(() => {
			current = (current + 1) % slides.length;
		}, 4000);
		return () => clearInterval(id);
	});

	function goTo(i: number) {
		current = i;
	}
	function next() {
		current = (current + 1) % slides.length;
	}
	function prev() {
		current = (current - 1 + slides.length) % slides.length;
	}

	const features = [
		{
			icon: '🐓',
			title: 'Batch Management',
			desc: 'Create and manage poultry batches, assign breeds, and track bird counts from arrival to completion.'
		},
		{
			icon: '🥚',
			title: 'Egg Production',
			desc: 'Record daily egg collection with quality breakdowns and view historic production logs.'
		},
		{
			icon: '🌾',
			title: 'Feed Tracking',
			desc: 'Log feed consumption per batch and compute conversion ratios over time.'
		},
		{
			icon: '📉',
			title: 'Mortality Logs',
			desc: 'Record daily deaths with automatic stock adjustments and cause categorization.'
		},
		{
			icon: '📊',
			title: 'Operations Dashboard',
			desc: 'Real-time overview of active flocks, total birds, and production metrics.'
		},
		{
			icon: '🔔',
			title: 'Smart Alerts',
			desc: 'Get notified when lay rate drops, mortality spikes, or a day of data is missing.'
		}
	];
</script>

<svelte:head>
	<title>Poultry ERP — Farm Management System</title>
	<meta
		name="description"
		content="A streamlined ERP for poultry farms: batch management, egg production, feed and mortality tracking."
	/>
</svelte:head>

<!-- ─── Hero Carousel ─── -->
<section
	class="relative h-[calc(100vh-4rem)] min-h-[560px] w-full overflow-hidden"
	onmouseenter={() => (paused = true)}
	onmouseleave={() => (paused = false)}
>
	{#each slides as slide, i}
		<div
			class="absolute inset-0 transition-opacity duration-1000 ease-out
				{i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}"
		>
			<img
				src={slide.image}
				alt={slide.title}
				class="h-full w-full object-cover"
				loading={i === 0 ? 'eager' : 'lazy'}
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/50 to-stone-900/30"></div>
		</div>
	{/each}

	<!-- Hero content -->
	<div class="relative z-10 flex h-full items-center">
		<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="max-w-2xl text-white">
				<div class="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur-sm">
					<span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
					{slides[current].eyebrow}
				</div>

				<h1 class="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
					{slides[current].title}
				</h1>

				<p class="mt-5 max-w-xl text-base leading-relaxed text-stone-200 sm:text-lg">
					{slides[current].subtitle}
				</p>

				<div class="mt-8 flex flex-wrap gap-3">
					<a
						href="/dashboard"
						class="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 hover:shadow-amber-500/40"
					>
						Open Dashboard
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</a>
					<a
						href="/batches/new"
						class="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
					>
						Create a batch
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Arrows -->
	<button
		type="button"
		onclick={prev}
		class="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/40 sm:block"
		aria-label="Previous slide"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
		</svg>
	</button>
	<button
		type="button"
		onclick={next}
		class="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/40 sm:block"
		aria-label="Next slide"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
		</svg>
	</button>

	<!-- Dots -->
	<div class="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
		{#each slides as _, i}
			<button
				type="button"
				onclick={() => goTo(i)}
				class="h-1.5 rounded-full transition-all
					{i === current ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'}"
				aria-label={`Go to slide ${i + 1}`}
			></button>
		{/each}
	</div>
</section>

<!-- ─── Features ───────────────────────────────────────────── -->
<section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-2xl text-center">
		<p class="text-xs font-semibold uppercase tracking-widest text-amber-600">Features</p>
		<h2 class="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
			Everything your farm needs
		</h2>
		<p class="mt-3 text-base leading-relaxed text-stone-600">
			Six tools that replace the spreadsheet chaos and give you one source of truth.
		</p>
	</div>

	<div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each features as f}
			<div
				class="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
			>
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl transition group-hover:bg-amber-100">
					{f.icon}
				</div>
				<h3 class="text-base font-semibold text-stone-900">{f.title}</h3>
				<p class="mt-2 text-sm leading-relaxed text-stone-600">{f.desc}</p>
			</div>
		{/each}
	</div>
</section>

<!-- ─── CTA ────────────────────────────────────────────────── -->
<section class="border-t border-stone-200 bg-white">
	<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
		<div
			class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 px-8 py-14 text-center shadow-xl sm:px-16"
		>
			<div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl"></div>
			<div class="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl"></div>

			<div class="relative">
				<h2 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
					Ready to take control of your flocks?
				</h2>
				<p class="mx-auto mt-3 max-w-xl text-sm text-stone-300 sm:text-base">
					Start with a single batch and grow from there. No setup fees, no training required.
				</p>
				<div class="mt-8 flex flex-wrap justify-center gap-3">
					<a
						href="/batches/new"
						class="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-900 shadow-lg transition hover:bg-amber-400"
					>
						Create your first batch
					</a>
					<a
						href="/batches"
						class="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
					>
						Browse existing batches
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
