<script lang="ts">
	import MagnifyMinus from '$lib/MagnifyMinus.svelte';
	import MagnifyPlus from '$lib/MagnifyPlus.svelte';
	import MinusSolid from '$lib/MinusSolid.svelte';
	import PlusSolid from '$lib/PlusSolid.svelte';
	import { onMount } from 'svelte';

	let { value = $bindable(0) }: { value?: number } = $props();

	let isDragging = $state(false);
	let startX: number | null = $state(0);
	let startV = $state(0);

	let sliderEl: HTMLDivElement;

	function handleStart(clientX: number) {
		isDragging = true;
		startX = clientX;
		startV = value;
	}

	function handleMove(clientX: number) {
		if (!isDragging || !sliderEl || !startX) return;

		const rect = sliderEl.getBoundingClientRect();
		const xChange = clientX - startX;
		const sliderWidth = rect.right - rect.left;
		value = Math.max(0, Math.min(1, (startV * sliderWidth + xChange) / sliderWidth));
	}

	function handleEnd() {
		isDragging = false;
		startX = null;
	}

	function handleMouseDown(e: MouseEvent) {
		handleStart(e.clientX);
	}

	function handleMouseMove(e: MouseEvent) {
		handleMove(e.clientX);
	}

	function handleMouseUp(e: MouseEvent) {
		handleEnd();
	}

	function handleTouchStart(e: TouchEvent) {
		e.preventDefault();
		handleStart(e.touches[0].clientX);
	}

	function handleTouchMove(e: TouchEvent) {
		if (isDragging) {
			e.preventDefault();
		}
		handleMove(e.touches[0].clientX);
	}

	function handleTouchEnd(e: TouchEvent) {
		if (isDragging) {
			e.preventDefault();
		}
		handleEnd();
	}

	onMount(() => {
		// Add touch event listeners with passive: false to allow preventDefault to
		// prevent scrolling of the page while adjusting slider
		sliderEl.addEventListener('touchstart', handleTouchStart, { passive: false });
		window.addEventListener('touchmove', handleTouchMove, { passive: false });
		window.addEventListener('touchend', handleTouchEnd, { passive: false });

		return () => {
			sliderEl.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('touchend', handleTouchEnd);
		};
	});
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={sliderEl}
	class="relative h-6 w-full cursor-pointer overflow-hidden rounded-full bg-gray-900 select-none"
	class:cursor-grabbing={isDragging}
	onmousedown={handleMouseDown}
>
	<div
		class="absolute h-full w-full rounded-full bg-white"
		style="left: -{100 - value * 100}%"
	></div>
	<div class="flex h-full items-center justify-between px-2 text-white mix-blend-difference">
		<div class="w-4">
			<MagnifyMinus />
		</div>
		<div class="w-4">
			<MagnifyPlus />
		</div>
	</div>
	<!-- TODO: add aria -->
	<!-- svelte-ignore a11y_role_has_required_aria_props -->
	<!-- <div class="absolute -left-full w-full"></div> -->
	<!-- <div -->
	<!-- 	class="absolute top-1/2 h-6 w-6 -translate-x-full -translate-y-1/2 cursor-pointer rounded-full bg-white" -->
	<!-- 	style="left: {value * 100}%" -->
	<!-- 	role="slider" -->
	<!-- 	tabindex="0" -->
	<!-- ></div> -->
</div>
