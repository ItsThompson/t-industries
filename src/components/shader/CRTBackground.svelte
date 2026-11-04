<script lang="ts">
	import { onMount } from 'svelte';
	import { createCRTShader, DEFAULT_CRT_CONFIG } from './crt-shader';
	import { observeMotionPreference } from '$lib/motion-preference';
	import type { CRTShader } from './crt-shader';

	let canvas: HTMLCanvasElement;
	let shader: CRTShader | null = null;
	let useFallback = false;

	function resizeToViewport(): void {
		if (!shader) return;
		shader.resize(window.innerWidth, window.innerHeight);
	}

	onMount(() => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		shader = createCRTShader(canvas, DEFAULT_CRT_CONFIG);

		if (!shader) {
			useFallback = true;
			return;
		}

		const cleanupMotion = observeMotionPreference({
			onReduce: () => {
				if (!shader) return;
				shader.stop();
				shader.resize(canvas.width, canvas.height);
			},
			onAnimate: () => {
				if (!shader) return;
				shader.start();
			}
		});

		window.addEventListener('resize', resizeToViewport);

		return () => {
			cleanupMotion();
			window.removeEventListener('resize', resizeToViewport);
			if (shader) {
				shader.destroy();
				shader = null;
			}
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed inset-0 w-full h-full z-0 pointer-events-none"
	class:hidden={useFallback}
	aria-hidden="true"
/>

{#if useFallback}
	<div class="crt-fallback" aria-hidden="true" />
{/if}

<style>
	.crt-fallback {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 2px,
			rgba(255, 99, 99, 0.03) 2px,
			rgba(255, 99, 99, 0.03) 4px
		);
	}
</style>
