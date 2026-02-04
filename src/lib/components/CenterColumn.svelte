<script lang="ts">
	let { children } = $props();
</script>

<div class="flex h-full w-full justify-center">
	<div class="h-full w-full max-w-md">
		{@render children?.()}
	</div>
</div>
