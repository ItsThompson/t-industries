import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, act } from '@testing-library/svelte';
import Layout from './(site)/+layout.svelte';
import {
	buildAfterNavigate,
	resetAfterNavigate,
	triggerAfterNavigate
} from '$lib/__mocks__/app-navigation';

function getScrollRegion(container: HTMLElement): HTMLElement {
	const region = container.querySelector<HTMLElement>('.overflow-y-auto');
	if (!region) {
		throw new Error('layout rendered without a scroll region');
	}
	return region;
}

function getRoot(container: HTMLElement): HTMLElement {
	const root = getScrollRegion(container).parentElement;
	if (!root) {
		throw new Error('scroll region is detached from the layout root');
	}
	return root;
}

function getNavbar(container: HTMLElement): HTMLElement {
	const navbar = getRoot(container).lastElementChild;
	if (!navbar) {
		throw new Error('layout rendered without a navbar');
	}
	return navbar as HTMLElement;
}

function getFooterWrappers(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>('footer')).map((footer) => {
		const wrapper = footer.parentElement;
		if (!wrapper) {
			throw new Error('footer rendered without a placement wrapper');
		}
		return wrapper;
	});
}

function getMobileFooterWrapper(container: HTMLElement): HTMLElement {
	const region = getScrollRegion(container);
	const wrapper = getFooterWrappers(container).find((candidate) => region.contains(candidate));
	if (!wrapper) {
		throw new Error('layout rendered without a footer inside the scroll region');
	}
	return wrapper;
}

function getDesktopFooterWrapper(container: HTMLElement): HTMLElement {
	const region = getScrollRegion(container);
	const wrapper = getFooterWrappers(container).find((candidate) => !region.contains(candidate));
	if (!wrapper) {
		throw new Error('layout rendered without a pinned footer');
	}
	return wrapper;
}

function stubViewportWidth(matches: boolean): { fireChange: (nextMatches: boolean) => void } {
	const listeners: Array<(event: { matches: boolean }) => void> = [];

	vi.stubGlobal(
		'matchMedia',
		vi.fn().mockImplementation((query: string) => ({
			matches,
			media: query,
			addEventListener: vi.fn(
				(event: string, listener: (event: { matches: boolean }) => void) => {
					if (event === 'change') {
						listeners.push(listener);
					}
				}
			),
			removeEventListener: vi.fn()
		}))
	);

	return {
		fireChange(nextMatches: boolean): void {
			for (const listener of listeners) {
				listener({ matches: nextMatches });
			}
		}
	};
}

function getBackgroundCanvases(container: HTMLElement): HTMLCanvasElement[] {
	return Array.from(container.querySelectorAll<HTMLCanvasElement>('canvas'));
}

describe('+layout', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			}))
		);
		HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
	});

	afterEach(() => {
		cleanup();
		resetAfterNavigate();
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('locks the viewport to one screen so the page itself never scrolls', async () => {
		const { container } = render(Layout);
		await act();

		const root = getRoot(container);
		expect(root.classList.contains('h-dvh')).toBe(true);
		expect(root.classList.contains('flex-col')).toBe(true);
		expect(root.classList.contains('overflow-hidden')).toBe(true);
	});

	it('hugs its content so the page centers while it fits, and shrinks to scroll when it does not', async () => {
		const { container } = render(Layout);
		await act();

		const region = getScrollRegion(container);
		expect(region.classList.contains('min-h-0')).toBe(true);
		expect(region.classList.contains('flex-1')).toBe(false);
	});

	it('stops scroll chaining so the pinned chrome cannot bounce', async () => {
		const { container } = render(Layout);
		await act();

		expect(getScrollRegion(container).classList.contains('overscroll-none')).toBe(true);
	});

	it('scrolls the footer with the content on mobile', async () => {
		const { container } = render(Layout);
		await act();

		const wrapper = getMobileFooterWrapper(container);
		expect(wrapper.classList.contains('md:hidden')).toBe(true);
	});

	it('places the mobile footer after the slot content so it marks the end of the page', async () => {
		const { container } = render(Layout);
		await act();

		expect(getScrollRegion(container).lastElementChild).toBe(getMobileFooterWrapper(container));
	});

	it('pins the desktop footer outside the scroll region so content never runs under it', async () => {
		const { container } = render(Layout);
		await act();

		const wrapper = getDesktopFooterWrapper(container);
		expect(wrapper.classList.contains('hidden')).toBe(true);
		expect(wrapper.classList.contains('md:block')).toBe(true);
		expect(getRoot(container).contains(wrapper)).toBe(true);
	});

	it('keeps the navbar outside the scroll region so it stays visible', async () => {
		const { container } = render(Layout);
		await act();

		const region = getScrollRegion(container);
		const navbar = getNavbar(container);
		expect(region.contains(navbar)).toBe(false);
		expect(getRoot(container).contains(navbar)).toBe(true);
	});

	it('centers the whole page on desktop and leaves overflowing content top-aligned', async () => {
		const { container } = render(Layout);
		await act();

		const root = getRoot(container);
		expect(root.classList.contains('justify-start')).toBe(true);
		expect(root.classList.contains('md:justify-center')).toBe(true);
	});

	it('resets the scroll region when a navigation completes', async () => {
		const { container } = render(Layout);
		await act();

		const region = getScrollRegion(container);
		const setScrollTop = vi.fn();
		Object.defineProperty(region, 'scrollTop', {
			configurable: true,
			get: () => 420,
			set: setScrollTop
		});

		triggerAfterNavigate(buildAfterNavigate({ type: 'link' }));

		expect(setScrollTop).toHaveBeenCalledWith(0);
	});

	describe('background effects', () => {
		it('renders no background effects on a narrow viewport', async () => {
			const { container } = render(Layout);
			await act();

			expect(getBackgroundCanvases(container)).toHaveLength(0);
		});

		it('renders both background effects on a wide viewport', async () => {
			stubViewportWidth(true);

			const { container } = render(Layout);
			await act();

			const canvases = getBackgroundCanvases(container);
			expect(canvases).toHaveLength(2);
			expect(canvases.some((canvas) => canvas.classList.contains('z-0'))).toBe(true);
			expect(canvases.some((canvas) => canvas.classList.contains('z-[1]'))).toBe(true);
		});

		it('mounts the backgrounds when the viewport grows past the threshold', async () => {
			const viewport = stubViewportWidth(false);

			const { container } = render(Layout);
			await act();
			expect(getBackgroundCanvases(container)).toHaveLength(0);

			viewport.fireChange(true);
			await act();

			expect(getBackgroundCanvases(container)).toHaveLength(2);
		});

		it('unmounts the backgrounds when the viewport shrinks below the threshold', async () => {
			const viewport = stubViewportWidth(true);

			const { container } = render(Layout);
			await act();
			expect(getBackgroundCanvases(container)).toHaveLength(2);

			viewport.fireChange(false);
			await act();

			expect(getBackgroundCanvases(container)).toHaveLength(0);
		});
	});
});
