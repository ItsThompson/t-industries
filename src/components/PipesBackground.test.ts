import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import PipesBackground from './PipesBackground.svelte';

describe('PipesBackground', () => {
	beforeEach(() => {
		const mockContext = {
			scale: vi.fn(),
			clearRect: vi.fn(),
			fillText: vi.fn(),
			font: '',
			textBaseline: '',
			fillStyle: '',
			globalAlpha: 1
		};

		HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext);
		vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
		vi.stubGlobal('cancelAnimationFrame', vi.fn());

		Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
		Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
		Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true });
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders a canvas element in the DOM', () => {
		const { container } = render(PipesBackground);
		const canvas = container.querySelector('canvas');

		expect(canvas).not.toBeNull();
	});

	it('canvas has fixed positioning with inset-0 and z-0', () => {
		const { container } = render(PipesBackground);
		const canvas = container.querySelector('canvas');

		expect(canvas?.classList.contains('fixed')).toBe(true);
		expect(canvas?.classList.contains('inset-0')).toBe(true);
		expect(canvas?.classList.contains('z-0')).toBe(true);
	});

	it('canvas is aria-hidden for accessibility', () => {
		const { container } = render(PipesBackground);
		const canvas = container.querySelector('canvas');

		expect(canvas?.getAttribute('aria-hidden')).toBe('true');
	});
});
