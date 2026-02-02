<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { ScanPresenter } from '$lib/presenters/ScanPresenter.svelte';

	interface Props {
		presenter: ScanPresenter;
	}

	const { presenter }: Props = $props();

	// Navigate between checkout and check-in modes
	function navigateToOtherMode() {
		const targetPath = presenter.mode === 'checkout' ? '/checkin' : '/';
		goto(targetPath);
	}

	let videoElement: HTMLVideoElement;

	onMount(() => {
		presenter.setup(videoElement);

		// Strip items from URL to clean up address bar
		const currentUrl = page.url;
		console.log(`[CheckoutCheckinPage] currentUrl: ${currentUrl.href}`);
		const cleanedUrl = presenter.stripItemsFromUrl(currentUrl);
		console.log(`[CheckoutCheckinPage] Cleaned url: ${cleanedUrl.href}`);
		if (cleanedUrl.href !== currentUrl.href) {
			goto(cleanedUrl);
		}
	});

	onDestroy(() => presenter.destroy());
</script>

<svelte:head>
	<title>{presenter.mode === 'checkin' ? 'SDSC Library Checkin' : 'SDSC Library Checkout'}</title>
</svelte:head>

<main class="container mx-auto px-4 py-1">
	<h1 class="mb-3 text-center text-xl font-bold">
		Scan all of your QR codes to {presenter.mode === 'checkin' ? 'check in' : 'check out'}
	</h1>

	<!-- Mode Switch Button -->
	<div class="mx-auto mb-4 max-w-md text-center">
		{#if presenter.mode === 'checkout'}
			<button
				onclick={navigateToOtherMode}
				class="text-sm text-blue-600 underline hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				Are you a librarian? Click here to check items in
			</button>
		{:else}
			<button
				onclick={navigateToOtherMode}
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
			class="absolute z-5 flex h-full w-full items-end bg-gradient-to-b from-transparent from-50% to-black to-140% pb-4"
		>
			<p class="w-full text-center text-sm text-white sm:text-2xl">
				Scan QR codes to add items to your list!
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
	<div class="mx-auto mt-2 max-w-md">
		<h2 class="mb-2 text-xl font-semibold">Scanned Items ({presenter.scannedItems.size})</h2>

		{#if presenter.scannedItems.size === 0}
			<p class="py-4 text-center text-gray-500">
				No items scanned yet. Items you scan will show up here.
			</p>
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
				onclick={() => presenter.goToCheckoutOrCheckin()}
				class="mt-4 w-full rounded bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600"
			>
				{presenter.getButtonText()}
			</button>
		{/if}
	</div>
</main>
