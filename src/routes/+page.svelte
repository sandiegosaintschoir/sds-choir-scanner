<script lang="ts">
	import CheckoutCheckinPage from '$lib/components/CheckoutCheckinPage.svelte';

	const { data } = $props();
</script>

<main class="h-full">
	<CheckoutCheckinPage
		scanPresenter={data.scanPresenter}
		controlsPresenter={data.controlsPresenter}
		videoElementProvider={data.videoElementProvider}
	/>
</main>
