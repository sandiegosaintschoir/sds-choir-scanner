<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Select from '$lib/components/ui/select';
	import type { ScanPresenter } from '$lib/presenters/ScanPresenter.svelte';
	import sdscBannerImg from '$lib/assets/san-diego-saints-choir-logo-full-color-rgb.svg';
	import CenterColumn from './CenterColumn.svelte';
	import TrashCanRegularFull from './TrashCanRegularFull.svelte';
	import XSolidFull from './XSolidFull.svelte';

	interface Props {
		presenter: ScanPresenter;
	}

	const { presenter }: Props = $props();

	// Navigate between checkout and check-in modes
	function navigateToOtherMode() {
		if (presenter.mode === 'checkout') {
			// Switching to checkin
			goto('/?mode=checkin');
		} else {
			// Switching to checkout - use clean URL without mode param
			goto('/');
		}
	}

	let videoElement: HTMLVideoElement;

	let selectedMode = $state<string>(presenter.mode);

	$effect(() => {
		if (selectedMode !== presenter.mode) {
			navigateToOtherMode();
		}
	});

	onMount(() => {
		presenter.setup(videoElement);

		// Strip any items from the URL to avoid adding them again on reload
		const currentUrl = page.url;
		const cleanedUrl = presenter.stripItemsFromUrl(currentUrl);
		if (cleanedUrl.href !== currentUrl.href) {
			goto(cleanedUrl);
		}
	});

	onDestroy(() => presenter.destroy());
</script>

<svelte:head>
	<title>{presenter.mode === 'checkin' ? 'SDSC Library Checkin' : 'SDSC Library Checkout'}</title>
</svelte:head>

<CenterColumn>
	<div class="flex h-full w-full flex-col">
		<div class="flex items-center justify-between px-3 py-2">
			<img
				class="w-[120px] xs:w-[164px]"
				alt="San Diego Saints Choir Banner Logo"
				src={sdscBannerImg}
			/>
			<Select.Root type="single" bind:value={selectedMode}>
				<Select.Trigger class="!h-6 px-1 py-0 text-xs xs:text-sm"
					>{selectedMode === 'checkin' ? 'Checkin' : 'Checkout'}</Select.Trigger
				>
				<Select.Content>
					<Select.Item class="text-sm" value="checkout">Checkout</Select.Item>
					<Select.Item class="text-sm" value="checkin">Checkin</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<p class="mb-3 px-3 text-center text-sm">
			Scan all of your QR codes to {presenter.mode === 'checkin'
				? 'check in. Only the choir librarian can check items in.'
				: 'check out'}
		</p>

		<!-- Video -->
		<div class="relative w-full">
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
				<!-- <p class="w-full text-center text-sm text-white sm:text-2xl"> -->
				<!-- 	Scan QR codes to add items to your list! -->
				<!-- </p> -->
			</div>
			<video
				bind:this={videoElement}
				autoplay
				muted
				playsinline
				class="aspect-square w-full object-cover"
			></video>
		</div>

		<!-- Scanned codes list -->
		<div class="mx-auto mt-2 flex w-full max-w-md flex-1 flex-col px-3">
			<h1 class="mb-2 text-xl">
				Scanned Items <span class="text-gray-400">({presenter.scannedItems.size})</span>
			</h1>
			<hr class="mb-1" />

			{#if presenter.scannedItems.size === 0}
				<p class="py-4 text-center text-gray-700">
					No items scanned yet. Items you scan will show up here.
				</p>
			{:else}
				{#each [...presenter.scannedItems.values()] as item, i (item.itemId)}
					{#if i > 0}
						<hr />
					{/if}
					<div class="flex items-center py-3">
						<div class="mr-3 flex w-full flex-col">
							<span class="text-sm break-all">{item.name}</span>
							<span class="text-xs break-all text-gray-500">[Id: {item.itemId}]</span>
						</div>
						<!-- TODO: Make it so that the button shows even when no items are scanned
                            but make it disabled -->
						<button
							onclick={() => presenter.removeScannedItem(item)}
							class="py-1 text-sm text-gray-700"
						>
							Remove
						</button>
					</div>
				{/each}
			{/if}
			<div class="flex flex-1 flex-col justify-end">
				<button
					onclick={() => presenter.goToCheckoutOrCheckin()}
					class="mt-4 mb-6 w-full rounded-sm bg-green-500 py-3 font-semibold text-white hover:bg-green-600 disabled:bg-gray-300"
					disabled={!presenter.hasItems}
				>
					{presenter.getButtonText()}
				</button>
			</div>
		</div>
	</div>
</CenterColumn>
