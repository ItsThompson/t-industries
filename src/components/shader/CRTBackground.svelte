<script lang="ts">
	import { onMount } from 'svelte';
	import { createCRTShader, getMobileScale, DEFAULT_CRT_CONFIG } from './crt-shader';
	import type { CRTShader } from './crt-shader';

	let canvas: HTMLCanvasElement;
	let shader: CRTShader | null = null;
	let useFallback = false;

	function getCanvasDimensions(): { width: number; height: number } {
		const scale = getMobileScale(window.innerWidth);
		return {
			width: Math.floor(window.innerWidth * scale),
			height: Math.floor(window.innerHeight * scale)
		};
	}

	function handleResize(): void {
		if (!shader) return;
		const { width, height } = getCanvasDimensions();
		shader.resize(width, height);
	}

	onMount(() => {
		const { width, height } = getCanvasDimensions();
		canvas.width = width;
		canvas.height = height;

		shader = createCRTShader(canvas, DEFAULT_CRT_CONFIG);

		if (!shader) {
			useFallback = true;
			return;
		}

		const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

		function applyMotionPreference(prefersReduced: boolean): void {
			if (!shader) return;
			if (prefersReduced) {
				shader.stop();
			} else {
				shader.start();
			}
		}

		applyMotionPreference(reducedMotionQuery.matches);

		function handleMotionChange(event: MediaQueryListEvent): void {
			applyMotionPreference(event.matches);
		}

		reducedMotionQuery.addEventListener('change', handleMotionChange);
		window.addEventListener('resize', handleResize);

		return () => {
			reducedMotionQuery.removeEventListener('change', handleMotionChange);
			window.removeEventListener('resize', handleResize);
			if (shader) {
				shader.destroy();
				shader = null;
			}
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed inset-0 z-0 pointer-events-none"
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
