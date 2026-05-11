<script lang="ts">
	import { onMount } from 'svelte';
	import { createEngine, step, getVisibleSegments } from './pipes-engine';
	import { observeMotionPreference } from '$lib/motion-preference';
	import type { PipesState } from './pipes-engine';

	const FONT_SIZE = 72;
	const FRAME_INTERVAL = 50; // ms (~20 FPS)
	const STRAIGHT_PROBABILITY = 0.7;
	const MIN_TAIL_LENGTH = 30;
	const MAX_TAIL_LENGTH = 50;
	const GRAY_COLOR = '#444444';
	const PRIMARY_COLOR = '#FF6363';

	let canvas: HTMLCanvasElement;
	let animationFrameId: number;
	let lastStepTime = 0;
	let state: PipesState;

	function getGridDimensions(): { cols: number; rows: number; cellWidth: number; cellHeight: number } {
		const cellHeight = FONT_SIZE;
		const cellWidth = FONT_SIZE * 0.6; // Standard monospace aspect ratio
		const cols = Math.floor(window.innerWidth / cellWidth);
		const rows = Math.floor(window.innerHeight / cellHeight);
		return { cols, rows, cellWidth, cellHeight };
	}

	function initCanvas(): { cellWidth: number; cellHeight: number } | null {
		if (!canvas) return null;

		const dpr = window.devicePixelRatio || 1;
		const width = window.innerWidth;
		const height = window.innerHeight;

		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;

		const ctx = canvas.getContext('2d');
		if (!ctx) return null;

		ctx.scale(dpr, dpr);
		ctx.font = `${FONT_SIZE}px monospace`;
		ctx.textBaseline = 'top';

		const { cols, rows, cellWidth, cellHeight } = getGridDimensions();

		state = createEngine({
			cols,
			rows,
			straightProbability: STRAIGHT_PROBABILITY,
			minTailLength: MIN_TAIL_LENGTH,
			maxTailLength: MAX_TAIL_LENGTH,
			grayColor: GRAY_COLOR,
			primaryColor: PRIMARY_COLOR
		});

		return { cellWidth, cellHeight };
	}

	function render(cellWidth: number, cellHeight: number): void {
		const ctx = canvas?.getContext('2d');
		if (!ctx || !state?.canAnimate) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const segments = getVisibleSegments(state);
		segments.forEach((segment) => {
			ctx.globalAlpha = segment.opacity;
			ctx.fillStyle = segment.color;
			const x = Math.round(segment.x * cellWidth);
			const y = Math.round(segment.y * cellHeight);
			ctx.fillText(segment.char, x, y);
		});

		ctx.globalAlpha = 1;
	}

	function renderStaticFrame(): void {
		const dimensions = initCanvas();
		if (!dimensions || !state?.canAnimate) return;

		const { cellWidth, cellHeight } = dimensions;
		step(state);
		render(cellWidth, cellHeight);
	}

	function startAnimation(): void {
		const dimensions = initCanvas();
		if (!dimensions || !state?.canAnimate) return;

		const { cellWidth, cellHeight } = dimensions;
		lastStepTime = 0;

		function animate(timestamp: number): void {
			if (timestamp - lastStepTime >= FRAME_INTERVAL) {
				step(state);
				render(cellWidth, cellHeight);
				lastStepTime = timestamp;
			}
			animationFrameId = requestAnimationFrame(animate);
		}

		animationFrameId = requestAnimationFrame(animate);
	}

	function stopAnimation(): void {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = 0;
		}
	}

	function handleResize(): void {
		stopAnimation();
		if (prefersReducedMotion) {
			renderStaticFrame();
		} else {
			startAnimation();
		}
	}

	let prefersReducedMotion = false;

	onMount(() => {
		const cleanupMotion = observeMotionPreference({
			onReduce: () => {
				prefersReducedMotion = true;
				stopAnimation();
				renderStaticFrame();
			},
			onAnimate: () => {
				prefersReducedMotion = false;
				stopAnimation();
				startAnimation();
			}
		});

		window.addEventListener('resize', handleResize);

		return () => {
			stopAnimation();
			cleanupMotion();
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed inset-0 z-[1] opacity-60 pointer-events-none"
	aria-hidden="true"
/>
