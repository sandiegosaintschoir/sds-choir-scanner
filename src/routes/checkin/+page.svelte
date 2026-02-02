<script lang="ts">
	import CheckoutCheckinPage from '$lib/components/CheckoutCheckinPage.svelte';

	const { data } = $props();
</script>

<CheckoutCheckinPage presenter={data.presenter} />
