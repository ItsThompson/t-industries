import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/svelte';
import RippleBackground from './RippleBackground.svelte';

interface MotionControl {
	setReducedMotion(matches: boolean): void;
}

function stubMotionPreference(reducedMotion: boolean): MotionControl {
	const listeners: Array<(event: { matches: boolean }) => void> = [];
	let current = reducedMotion;

	vi.stubGlobal(
		'matchMedia',
		vi.fn().mockImplementation((query: string) => ({
			get matches() {
				return current;
			},
			media: query,
			addEventListener: vi.fn((event: string, listener: (event: { matches: boolean }) => void) => {
				if (event === 'change') listeners.push(listener);
			}),
			removeEventListener: vi.fn()
		}))
	);

	return {
		setReducedMotion(matches: boolean): void {
			current = matches;
			for (const listener of listeners) listener({ matches });
		}
	};
}

function pressPointer(target: EventTarget, pointerType = 'mouse'): void {
	target.dispatchEvent(
		new PointerEvent('pointerdown', {
			bubbles: true,
			button: 0,
			clientX: 40,
			clientY: 60,
			pointerType
		})
	);
}

describe('RippleBackground', () => {
	let rafMock: ReturnType<typeof vi.fn>;
	let canvasContext: { clearRect: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		canvasContext = { clearRect: vi.fn() };
		HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
			setTransform: vi.fn(),
			clearRect: canvasContext.clearRect,
			globalAlpha: 1
		});
		rafMock = vi.fn().mockReturnValue(1);
		vi.stubGlobal('requestAnimationFrame', rafMock);
		vi.stubGlobal('cancelAnimationFrame', vi.fn());
		stubMotionPreference(false);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('lays a canvas the reader cannot touch', async () => {
		const { container } = render(RippleBackground);
		await act();

		const canvas = container.querySelector('canvas');
		expect(canvas).not.toBeNull();
		expect(canvas?.className).toContain('pointer-events-none');
		expect(canvas?.className).toContain('fixed');
		expect(canvas?.className).toContain('inset-0');
		expect(canvas?.getAttribute('aria-hidden')).toBe('true');
	});

	it('leaves the layer order to the DOM, so the page text stays on top', async () => {
		const { container } = render(RippleBackground);
		await act();

		const canvas = container.querySelector('canvas');
		expect(canvas?.className ?? '').not.toMatch(/(^|\s)z-/);
		expect(canvas?.className ?? '').not.toContain('mix-blend');
	});

	it('renders no canvas when the reader asks for reduced motion', async () => {
		stubMotionPreference(true);

		const { container } = render(RippleBackground);
		await act();

		expect(container.querySelector('canvas')).toBeNull();
	});

	it('follows a change of motion preference at runtime', async () => {
		const motion = stubMotionPreference(false);
		const { container } = render(RippleBackground);
		await act();
		expect(container.querySelector('canvas')).not.toBeNull();

		motion.setReducedMotion(true);
		await act();
		expect(container.querySelector('canvas')).toBeNull();

		motion.setReducedMotion(false);
		await act();
		expect(container.querySelector('canvas')).not.toBeNull();
	});

	it('asks for a frame when a press misses the controls', async () => {
		render(RippleBackground);
		await act();

		pressPointer(document.body);

		expect(rafMock).toHaveBeenCalledTimes(1);
	});

	it('holds back when the press hits a link', async () => {
		const link = document.createElement('a');
		link.href = '/terminal';
		document.body.appendChild(link);

		render(RippleBackground);
		await act();

		pressPointer(link);
		expect(rafMock).not.toHaveBeenCalled();

		link.remove();
	});

	it('stops the frame loop once the ripples have played out', async () => {
		render(RippleBackground);
		await act();

		pressPointer(document.body);
		expect(rafMock).toHaveBeenCalledTimes(1);

		const frame = rafMock.mock.calls[0][0] as (now: number) => void;
		frame(performance.now() + 10_000);

		expect(canvasContext.clearRect).toHaveBeenCalled();
		expect(rafMock).toHaveBeenCalledTimes(1);
	});

	it('stops listening once the backdrop is gone', async () => {
		const { unmount } = render(RippleBackground);
		await act();
		unmount();

		pressPointer(document.body);

		expect(rafMock).not.toHaveBeenCalled();
	});
});
