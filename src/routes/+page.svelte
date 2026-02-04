<script lang="ts">
	import CheckoutCheckinPage from '$lib/components/CheckoutCheckinPage.svelte';

	const { data } = $props();
</script>

<main class="h-full">
	<CheckoutCheckinPage presenter={data.presenter} />
</main>
