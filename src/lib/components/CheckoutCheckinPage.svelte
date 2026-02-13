<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { backOut } from 'svelte/easing';
	import * as Select from '$lib/components/ui/select';
	import sdscBannerImg from '$lib/assets/san-diego-saints-choir-logo-full-color-rgb.svg';
	import CenterColumn from './CenterColumn.svelte';
	import CheckCircleFill from './CheckCircleFill.svelte';
	import XSolidFull from './XSolidFull.svelte';
	import { fade } from 'svelte/transition';
	import type { ScanPresenter } from '$lib/presenters/ScanPresenter.svelte';
	import type { ScanControlsPresenter } from '$lib/presenters/ScanControlsPresenter.svelte';
	import { VideoElementProvider } from '$lib/VideoElementProvider.svelte';
	import Slider from './ui/sdsaints/Slider.svelte';
	import PinchInput from './ui/sdsaints/PinchInput.svelte';

	interface Props {
		scanPresenter: ScanPresenter;
		controlsPresenter: ScanControlsPresenter;
		videoElementProvider: VideoElementProvider;
	}

	let { scanPresenter, controlsPresenter, videoElementProvider }: Props = $props();

	// Custom transition: scale in with bounce, then fade out
	function scaleAndFade(node: HTMLElement, { duration = 1000, pause = 100, scaleDelay = 700 }) {
		return {
			duration,
			css: (t: number) => {
				if (t < scaleDelay / duration) {
					const scaleProgress = t / (scaleDelay / duration);
					const scale = backOut(scaleProgress);
					return `transform: scale(${scale}); opacity: 1;`;
				} else if (t < (scaleDelay + pause) / duration) {
					return `transform: scale(1); opacity: 1;`;
				}
				const fadeProgress =
					(t - (scaleDelay + pause) / duration) / (1 - (scaleDelay + pause) / duration);
				const opacity = 1 - fadeProgress;
				return `transform: scale(1); opacity: ${opacity};`;
			},
			tick: (t: number) => {
				if (t === 0) {
					node.style.opacity = '1';
				}
				// When transition completes (t = 1), keep opacity at 0
				if (t === 1) {
					node.style.opacity = '0';
				}
			}
		};
	}

	onMount(() => {
		// TODO: This feels like it shouldn't work... but are derived values guaranteed to
		// be computed before the onMount is run? And are bind:this values computed before
		// onMount? It must be the case because this works. Is it a race condition?
		if (!videoElementProvider.videoElementRef.videoElement) return;
		scanPresenter.setup(videoElementProvider.videoElementRef.videoElement);

		const handler = () => {
			if (!videoElementProvider.videoElementRef.videoElement) return;
			videoElementProvider.incrementVersion();
		};

		videoElementProvider.videoElementRef.videoElement.addEventListener('loadedmetadata', handler);

		return () => {
			videoElementProvider.videoElementRef.videoElement?.removeEventListener(
				'loadedmetadata',
				handler
			);
		};
	});

	onDestroy(() => {
		scanPresenter.destroy();
	});

	let zoomValue: number = $state(0);
	$effect(() => {
		console.log(`effect, zoomValue: ${zoomValue}`);
		if (!controlsPresenter.zoomCapabilities) return;
		console.log('setting zoom calling zoomValue');
		controlsPresenter.setZoom(zoomValue);
	});
</script>

<svelte:head>
	<title
		>{scanPresenter.mode === 'checkin' ? 'SDSC Library Checkin' : 'SDSC Library Checkout'}</title
	>
</svelte:head>
<!-- TODO: remove -->
<p>{zoomValue}</p>

<CenterColumn>
	<div class="flex min-h-full w-full flex-col">
		<div class="flex items-center justify-between px-3 py-2">
			<img
				class="w-[120px] xs:w-[164px]"
				alt="San Diego Saints Choir Banner Logo"
				src={sdscBannerImg}
			/>
			<Select.Root type="single" bind:value={scanPresenter.mode}>
				<Select.Trigger class="!h-6 px-1 py-0 text-xs xs:text-sm"
					>{scanPresenter.mode === 'checkin' ? 'Checkin' : 'Checkout'}</Select.Trigger
				>
				<Select.Content>
					<Select.Item class="text-sm" value="checkout">Checkout</Select.Item>
					<Select.Item class="text-sm" value="checkin">Checkin</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<p class="mb-3 px-3 text-center text-sm">
			Scan all of your QR codes to {scanPresenter.mode === 'checkin'
				? 'check in. Only the choir librarian can check items in.'
				: 'check out'}
		</p>

		<!-- Video -->
		<div id="video-container" class="aspect-square w-full">
			<div class="absolute z-20 h-full w-full">
				<PinchInput bind:value={zoomValue} />
			</div>
			{#key scanPresenter.checkKey}
				<div class="absolute z-10 flex h-full w-full items-center justify-center">
					<div
						class="h-12 w-12 rounded-full text-white opacity-0"
						in:scaleAndFade={{ duration: 1000, scaleDelay: 400, pause: 500 }}
					>
						<CheckCircleFill />
					</div>
				</div>
			{/key}
			<!-- Note: When a mobile device is on low-power mode, the play button on the video
            element cannot be hidden with CSS, so it will show up even if we don't have controls
            enabled -->
			<video
				bind:this={videoElementProvider.videoElementBinding}
				autoplay
				muted
				playsinline
				class="aspect-square w-full object-cover"
			></video>
		</div>
		<!-- <div class="px-5"> -->
		<!-- 	<!-- It might be easier to just make our own zoom slider because I don't think the -->
		<!--           shadcn one really fits what I am looking for. -->
		<!-- 	<Slider.Root type="single" bind:value={zoomValue} min={0} max={1} step={0.01} /> -->
		<!-- </div> -->

		{#if scanPresenter.errorMessage}
			<div
				class="mx-3 my-2 flex items-center rounded-sm bg-red-100/75 px-2 py-2"
				transition:fade={{ duration: 200 }}
			>
				<p class="flex-1">{scanPresenter.errorMessage}</p>
				<button
					class="mr-2 ml-2 w-6 text-black/70"
					onclick={() => scanPresenter.clearErrorMessage()}><XSolidFull /></button
				>
			</div>
		{/if}

		<!-- Scanned codes list -->
		<div class="mx-auto mt-2 flex w-full max-w-md flex-1 flex-col px-3">
			<div class="mb-2 flex items-center justify-between">
				<h1 class="text-xl">
					Scanned Items <span class="text-gray-700">({scanPresenter.scannedItems.size})</span>
				</h1>
				<p class="text-xs text-gray-700">Max. {scanPresenter.maxItems}</p>
			</div>
			<hr class="mb-1" />

			{#if scanPresenter.scannedItems.size === 0}
				<p class="py-4 text-center text-gray-700">
					No items scanned yet. Items you scan will show up here.
				</p>
			{:else}
				{#each [...scanPresenter.scannedItems.values()] as item, i (item.itemId)}
					{#if i > 0}
						<hr />
					{/if}
					<div class="flex items-center py-3">
						<div class="mr-3 flex w-full flex-col">
							<span class="text-sm break-all">{item.name}</span>
							<span class="text-xs break-all text-gray-500">[Id: {item.itemId}]</span>
						</div>
						<button
							onclick={() => scanPresenter.removeScannedItem(item)}
							class="py-1 text-sm text-gray-700"
						>
							Remove
						</button>
					</div>
				{/each}
			{/if}
			<div class="flex flex-1 flex-col justify-end">
				<button
					onclick={() => scanPresenter.goToCheckoutOrCheckin()}
					class="mt-4 mb-6 w-full rounded-sm bg-green-500 py-3 font-semibold text-white hover:bg-green-600 disabled:bg-gray-300"
					disabled={scanPresenter.submitDisabled}
				>
					{scanPresenter.getButtonText()}
				</button>
			</div>
		</div>
	</div>
</CenterColumn>

<style>
	#video-container {
		overflow: hidden !important;
		position: relative;
		clip-path: inset(0);
	}
	#video-container :global(.scan-region-highlight) {
		border-radius: 30px;
		outline: rgba(0, 0, 0, 0.25) solid 50vmax;
	}
	#video-container :global(.scan-region-highlight-svg) {
		display: none;
	}
	#video-container :global(.code-outline-highlight) {
		stroke: rgba(255, 255, 255, 0.5) !important;
		stroke-width: 15 !important;
		stroke-dasharray: none !important;
	}
</style>
