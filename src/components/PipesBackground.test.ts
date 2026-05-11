import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/svelte';
import PipesBackground from './PipesBackground.svelte';

describe('PipesBackground', () => {
	let mockContext: Record<string, unknown>;
	let rafMock: ReturnType<typeof vi.fn>;
	let cafMock: ReturnType<typeof vi.fn>;
	let matchMediaMock: ReturnType<typeof vi.fn>;
	let motionChangeListeners: Array<(event: { matches: boolean }) => void>;

	beforeEach(() => {
		motionChangeListeners = [];

		mockContext = {
			scale: vi.fn(),
			clearRect: vi.fn(),
			fillText: vi.fn(),
			font: '',
			textBaseline: '',
			fillStyle: '',
			globalAlpha: 1
		};

		HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext);

		rafMock = vi.fn().mockReturnValue(1);
		cafMock = vi.fn();
		vi.stubGlobal('requestAnimationFrame', rafMock);
		vi.stubGlobal('cancelAnimationFrame', cafMock);

		matchMediaMock = vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			addEventListener: vi.fn((event: string, listener: (event: { matches: boolean }) => void) => {
				if (event === 'change') {
					motionChangeListeners.push(listener);
				}
			}),
			removeEventListener: vi.fn()
		}));
		vi.stubGlobal('matchMedia', matchMediaMock);

		Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
		Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
		Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true });
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders a canvas element in the DOM', async () => {
		const { container } = render(PipesBackground);
		await act();
		const canvas = container.querySelector('canvas');

		expect(canvas).not.toBeNull();
	});

	it('canvas has fixed positioning with inset-0 and z-[1]', async () => {
		const { container } = render(PipesBackground);
		await act();
		const canvas = container.querySelector('canvas');

		expect(canvas?.classList.contains('fixed')).toBe(true);
		expect(canvas?.classList.contains('inset-0')).toBe(true);
		expect(canvas?.classList.contains('z-[1]')).toBe(true);
	});

	it('canvas has opacity-60 class applied', async () => {
		const { container } = render(PipesBackground);
		await act();
		const canvas = container.querySelector('canvas');

		expect(canvas?.classList.contains('opacity-60')).toBe(true);
	});

	it('canvas has pointer-events-none class', async () => {
		const { container } = render(PipesBackground);
		await act();
		const canvas = container.querySelector('canvas');

		expect(canvas?.classList.contains('pointer-events-none')).toBe(true);
	});

	it('canvas is aria-hidden for accessibility', async () => {
		const { container } = render(PipesBackground);
		await act();
		const canvas = container.querySelector('canvas');

		expect(canvas?.getAttribute('aria-hidden')).toBe('true');
	});

	it('requestAnimationFrame is called after mount when motion is not reduced', async () => {
		render(PipesBackground);
		await act();

		expect(rafMock).toHaveBeenCalled();
	});

	it('cancelAnimationFrame is called on unmount', async () => {
		const { unmount } = render(PipesBackground);
		await act();
		unmount();

		expect(cafMock).toHaveBeenCalled();
	});

	it('does not start animation with very small viewport', async () => {
		// Grid: 50/(72*0.6) ≈ 1 col, 50/72 ≈ 0 rows → below 10x10 minimum
		Object.defineProperty(window, 'innerWidth', { value: 50, writable: true });
		Object.defineProperty(window, 'innerHeight', { value: 50, writable: true });

		render(PipesBackground);
		await act();

		expect(rafMock).not.toHaveBeenCalled();
	});

	describe('prefers-reduced-motion', () => {
		it('does not call requestAnimationFrame when reduced motion is preferred', async () => {
			matchMediaMock.mockImplementation((query: string) => ({
				matches: true,
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			}));

			render(PipesBackground);
			await act();

			expect(rafMock).not.toHaveBeenCalled();
		});

		it('renders a single static frame when reduced motion is preferred', async () => {
			matchMediaMock.mockImplementation((query: string) => ({
				matches: true,
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			}));

			render(PipesBackground);
			await act();

			// fillText is called for the static render (at least once for pipe segments)
			expect(mockContext.fillText).toHaveBeenCalled();
		});

		it('registers a change listener on the reduced-motion media query', async () => {
			const addEventListenerSpy = vi.fn();
			matchMediaMock.mockImplementation((query: string) => ({
				matches: false,
				media: query,
				addEventListener: addEventListenerSpy,
				removeEventListener: vi.fn()
			}));

			render(PipesBackground);
			await act();

			expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
		});

		it('removes change listener on unmount', async () => {
			const removeEventListenerSpy = vi.fn();
			matchMediaMock.mockImplementation((query: string) => ({
				matches: false,
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: removeEventListenerSpy
			}));

			const { unmount } = render(PipesBackground);
			await act();
			unmount();

			expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
		});

		it('stops animation when motion preference changes to reduce', async () => {
			let changeListener: ((event: { matches: boolean }) => void) | null = null;
			matchMediaMock.mockImplementation((query: string) => ({
				matches: false,
				media: query,
				addEventListener: vi.fn((_event: string, listener: (event: { matches: boolean }) => void) => {
					changeListener = listener;
				}),
				removeEventListener: vi.fn()
			}));

			render(PipesBackground);
			await act();

			// Animation started (rafMock called)
			expect(rafMock).toHaveBeenCalled();

			// Simulate change to reduced motion
			rafMock.mockClear();
			cafMock.mockClear();

			if (changeListener) {
				(changeListener as (event: { matches: boolean }) => void)({ matches: true });
			}
			await act();

			// cancelAnimationFrame should have been called to stop the loop
			expect(cafMock).toHaveBeenCalled();
			// No new requestAnimationFrame for ongoing animation
			expect(rafMock).not.toHaveBeenCalled();
		});
	});
});
