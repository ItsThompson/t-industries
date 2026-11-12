<script lang="ts">
	import { onMount } from 'svelte';
	import { observeMotionPreference } from '$lib/motion-preference';
	import { rippleBackdrop } from './ripple-backdrop';

	// Rendered only once motion is allowed, so a prerendered page contains no canvas at all.
	let motionAllowed = false;

	onMount(() =>
		observeMotionPreference({
			onReduce: () => (motionAllowed = false),
			onAnimate: () => (motionAllowed = true)
		})
	);
</script>

<!-- No z-index: paint order comes from the DOM, which keeps the ripples above the
     grain and below the page text. -->
{#if motionAllowed}
	<canvas use:rippleBackdrop class="pointer-events-none fixed inset-0" aria-hidden="true" />
{/if}
