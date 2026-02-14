<script lang="ts">
	import { onMount } from 'svelte';

	let { value = $bindable(1) }: { value?: number } = $props();

	let initialValue = $state<number | undefined>();
	let isPinching = $state(false);
	let initialDist = $state<number>();

	let pinchInputEl: HTMLDivElement;

	function dist(p1: [number, number], p2: [number, number]) {
		return Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
	}

	function handleTouchStart(e: TouchEvent) {
		console.log('touch start', e.touches.length);
		if (e.touches.length !== 2) return;
		e.preventDefault();

		isPinching = true;
		const p1: [number, number] = [e.touches[0].clientX, e.touches[0].clientY];
		const p2: [number, number] = [e.touches[1].clientX, e.touches[1].clientY];
		initialDist = dist(p1, p2);
		console.log(`setting initial dist: ${initialDist}`);
		initialValue = value;
		console.log(`setting initial value: ${initialValue}`);
	}

	function handleTouchMove(e: TouchEvent) {
		console.log('touch move', e.touches.length);
		if (
			e.touches.length !== 2 ||
			initialValue === undefined ||
			initialDist === undefined ||
			!isPinching
		)
			return;

		e.preventDefault(); // Stop the page from scrolling while we are pinching

		const curP1: [number, number] = [e.touches[0].clientX, e.touches[0].clientY];
		const curP2: [number, number] = [e.touches[1].clientX, e.touches[1].clientY];
		const curDist = dist(curP1, curP2);
		const changeFactor = curDist / initialDist;
		console.log(`changeFactor: ${changeFactor}`);

		// TODO: The 0-1 range doesnt work well here because 0 * anything is 0.
		// We should adjust the range internally but still output 0-1 (I think)
		const newVal = Math.max(1, Math.min(4, initialValue * changeFactor));
		console.log(`Setting value to ${newVal}`);
		value = newVal;
	}

	function handleTouchEnd(e: TouchEvent) {
		console.log('touch end');
		if (isPinching) {
			e.preventDefault();
		}
		isPinching = false;
		initialDist = undefined;
	}

	onMount(() => {
		// Add touch event listeners with passive: false to allow preventDefault to
		// prevent scrolling of the page while adjusting slider
		pinchInputEl.addEventListener('touchstart', handleTouchStart, { passive: false });
		window.addEventListener('touchmove', handleTouchMove, { passive: false });
		window.addEventListener('touchend', handleTouchEnd, { passive: false });

		return () => {
			pinchInputEl.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('touchend', handleTouchEnd);
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- TODO: Do we need select-none? -->
<div
	bind:this={pinchInputEl}
	class="h-full w-full select-none"
	class:cursor-grabbing={isPinching}
></div>
