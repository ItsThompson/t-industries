import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/svelte';
import PipesBackground from './PipesBackground.svelte';

describe('PipesBackground', () => {
	let mockContext: Record<string, unknown>;
	let rafMock: ReturnType<typeof vi.fn>;
	let cafMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
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

	it('canvas has fixed positioning with inset-0 and z-0', async () => {
		const { container } = render(PipesBackground);
		await act();
		const canvas = container.querySelector('canvas');

		expect(canvas?.classList.contains('fixed')).toBe(true);
		expect(canvas?.classList.contains('inset-0')).toBe(true);
		expect(canvas?.classList.contains('z-0')).toBe(true);
	});

	it('canvas is aria-hidden for accessibility', async () => {
		const { container } = render(PipesBackground);
		await act();
		const canvas = container.querySelector('canvas');

		expect(canvas?.getAttribute('aria-hidden')).toBe('true');
	});

	it('requestAnimationFrame is called after mount', async () => {
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
});
