<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { ScanPresenter } from '$lib/presenters/ScanPresenter.svelte';
	import type { ScanMode } from '$lib/config';

	// Parse mode from URL query parameter
	function getModeFromUrl(): ScanMode {
		if (typeof window === 'undefined') return 'checkout';
		const params = new URLSearchParams(window.location.search);
		const mode = params.get('mode');
		return mode === 'checkin' ? 'checkin' : 'checkout';
	}

	// Switch between checkout and check-in modes
	function switchToMode(newMode: ScanMode) {
		const params = new URLSearchParams(window.location.search);
		if (newMode === 'checkin') {
			params.set('mode', 'checkin');
		} else {
			params.delete('mode');
		}
		const queryString = params.toString();
		const pathname = window.location.pathname;
		window.location.href = queryString ? `${pathname}?${queryString}` : pathname;
	}

	// TODO: Handle this in a more predictable and immutable way
	const mode = getModeFromUrl();
	const presenter = new ScanPresenter(page.url.href, mode);
	let videoElement: HTMLVideoElement;

	onMount(() => presenter.setup(videoElement));
	onDestroy(() => presenter.destroy());
</script>

<svelte:head>
	<title>{mode === 'checkin' ? 'SDSC Library Checkin' : 'SDSC Library Checkout'}</title>
</svelte:head>

<main class="container mx-auto p-4">
	<h1 class="mb-6 text-center text-3xl font-bold">
		{mode === 'checkin' ? 'Choir Library Checkin' : 'Choir Library Checkout'}
	</h1>

	<!-- Mode Switch Button -->
	<div class="mx-auto mb-4 max-w-md text-center">
		{#if mode === 'checkout'}
			<button
				onclick={() => switchToMode('checkin')}
				class="text-sm text-blue-600 underline hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				Are you a librarian? Click here to check items in
			</button>
		{:else}
			<button
				onclick={() => switchToMode('checkout')}
				class="text-sm text-blue-600 underline hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				Click here to check items out
			</button>
		{/if}
	</div>

	<!-- Video -->
	<div class="relative mx-auto max-w-md">
		<div class="absolute z-10 flex h-full w-full items-center justify-center">
			<svg
				class="h-3/4 w-3/4"
				viewBox="0 0 24 24"
				stroke="#ffffff"
				stroke-width="0.5"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M22 17V22H17" stroke-linecap="round" stroke-linejoin="round" />
				<path d="M7 22H2V17" stroke-linecap="round" stroke-linejoin="round" />
				<path d="M17 2H22V7" stroke-linecap="round" stroke-linejoin="round" />
				<path d="M7 2H2V7" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</div>
		<div
			class="absolute z-5 flex h-full w-full items-end bg-gradient-to-b from-transparent from-50% to-black to-150% pb-4"
		>
			<p class="w-full text-center text-sm text-white sm:text-2xl">
				Scan QR codes to add items to list!
			</p>
		</div>
		<video
			bind:this={videoElement}
			autoplay
			muted
			playsinline
			class="aspect-square w-full rounded object-cover"
		></video>
	</div>

	<!-- Scanned codes list -->
	<div class="mx-auto mt-8 max-w-md">
		<h2 class="mb-4 text-xl font-semibold">Scanned Items ({presenter.scannedItems.size})</h2>

		{#if presenter.scannedItems.size === 0}
			<p class="py-8 text-center text-gray-500">No codes scanned yet</p>
		{:else}
			<div class="space-y-2">
				{#each [...presenter.scannedItems.values()] as item (item.itemId)}
					<div class="flex items-center gap-2 rounded border border-blue-200 bg-blue-50 p-3">
						<div class="flex w-full items-center justify-start">
							<span class="mr-4 text-sm break-all">{item.name}</span>
							<span class="text-sm break-all">[Id: {item.itemId}]</span>
						</div>
						<button
							onclick={() => presenter.removeScannedItem(item)}
							class="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
						>
							Remove
						</button>
					</div>
				{/each}
			</div>

			<button
				onclick={() => (window.location.href = presenter.getCheckoutUrl())}
				class="mt-4 w-full rounded bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600"
			>
				{presenter.getButtonText()}
			</button>
		{/if}
	</div>
</main>
