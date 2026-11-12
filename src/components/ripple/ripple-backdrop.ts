import { createRippleEngine } from './ripple-engine';
import { isInteractiveTarget } from './interactive-target';
import { RIPPLE_PALETTE, RIPPLE_SETTINGS } from './ripple-settings';
import { RIPPLE_STRATEGIES } from './strategies';

const MAX_DEVICE_PIXEL_RATIO = 2;

export interface RippleBackdropAction {
	destroy(): void;
}

/**
 * Svelte action that runs the ripple backdrop on a canvas. It listens on the
 * window because the canvas itself is pointer-events-none.
 */
export function rippleBackdrop(node: HTMLCanvasElement): RippleBackdropAction {
	const context2d = node.getContext('2d');
	// The backdrop is decoration, so a canvas without a 2d context simply stays blank.
	if (!context2d) return { destroy() {} };

	return runBackdrop(node, context2d);
}

function runBackdrop(
	node: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D
): RippleBackdropAction {
	const engine = createRippleEngine({
		settings: RIPPLE_SETTINGS,
		palette: RIPPLE_PALETTE,
		strategies: RIPPLE_STRATEGIES
	});

	let frameId = 0;
	let viewportWidthPx = 0;
	let viewportHeightPx = 0;

	function resize(): void {
		const devicePixelRatio = Math.min(MAX_DEVICE_PIXEL_RATIO, window.devicePixelRatio || 1);
		viewportWidthPx = window.innerWidth;
		viewportHeightPx = window.innerHeight;
		node.width = Math.floor(viewportWidthPx * devicePixelRatio);
		node.height = Math.floor(viewportHeightPx * devicePixelRatio);
		node.style.width = `${viewportWidthPx}px`;
		node.style.height = `${viewportHeightPx}px`;
		ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
	}

	function requestFrame(): void {
		if (frameId !== 0) return;

		frameId = requestAnimationFrame((now) => {
			frameId = 0;
			ctx.clearRect(0, 0, viewportWidthPx, viewportHeightPx);

			if (engine.frame(ctx, now) > 0) requestFrame();
		});
	}

	function handlePointerDown(event: PointerEvent): void {
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		if (isInteractiveTarget(event.target)) return;

		engine.spawn(event.clientX, event.clientY, performance.now());
		requestFrame();
	}

	resize();
	window.addEventListener('pointerdown', handlePointerDown);
	window.addEventListener('resize', resize);

	return {
		destroy(): void {
			if (frameId !== 0) cancelAnimationFrame(frameId);
			frameId = 0;
			window.removeEventListener('pointerdown', handlePointerDown);
			window.removeEventListener('resize', resize);
			engine.reset();
		}
	};
}
