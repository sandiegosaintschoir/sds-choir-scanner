<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/sdsc-logo-yellow-orange-tiny.png';
	import sdscBannerImg from '$lib/assets/san-diego-saints-choir-logo-full-color-rgb.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" type="image/png" href={favicon} /></svelte:head>
<img class="m-auto max-w-lg" alt="San Diego Saints Choir Banner Logo" src={sdscBannerImg} />
{@render children()}
