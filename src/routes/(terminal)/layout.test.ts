import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, act, fireEvent } from '@testing-library/svelte';
import Layout from './+layout.svelte';
import terminalCss from '../../terminal.css?raw';
import {
	buildAfterNavigate,
	getReplaceStateCalls,
	resetAfterNavigate,
	resetReplaceState,
	triggerAfterNavigate
} from '$lib/__mocks__/app-navigation';
import { resetPageRoute, setPageUrl } from '$lib/__mocks__/app-stores';
import { clearToasts } from '$lib/toasts';

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

function getHeadStyle(): string {
	return Array.from(document.head.querySelectorAll('style'))
		.map((style) => style.textContent ?? '')
		.join('\n');
}

function stylesheetSelectors(css: string): string[] {
	const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
	const selectors: string[] = [];
	let remaining = withoutComments;

	while (true) {
		const open = remaining.indexOf('{');
		const close = open === -1 ? -1 : remaining.indexOf('}', open);
		if (close === -1) return selectors;

		selectors.push(
			...remaining
				.slice(0, open)
				.split(',')
				.map((selector) => selector.trim())
				.filter((selector) => selector.length > 0)
		);
		remaining = remaining.slice(close + 1);
	}
}

const PAGE_LEVEL_SELECTOR = /^(:root|html|body)\b/;

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

	it('paints the page background before hydration', async () => {
		render(Layout);
		await act();

		expect(getHeadStyle()).toContain('background-color: #000');
	});

	it('leaves the content layer to the page background', async () => {
		const { container } = render(Layout);
		await act();

		const root = getRoot(container);
		expect(root.classList.contains('bg-black')).toBe(false);
		expect(root.classList.contains('z-10')).toBe(true);
	});

	it('keeps page-level selectors out of the terminal stylesheet', () => {
		const pageLevelSelectors = stylesheetSelectors(terminalCss).filter((selector) =>
			PAGE_LEVEL_SELECTOR.test(selector)
		);

		expect(pageLevelSelectors).toEqual([]);
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

	describe('canvas origin notice', () => {
		beforeEach(() => {
			clearToasts();
			resetReplaceState();
			window.history.replaceState({}, '', '/terminal/experience?from=canvas');
			setPageUrl('/terminal/experience', '?from=canvas');
		});

		afterEach(() => {
			window.history.replaceState({}, '', '/');
			resetPageRoute();
			clearToasts();
		});

		it('offers the way back when the reader arrived from the canvas', async () => {
			const { container } = render(Layout);
			await act();

			expect(container.querySelector('[data-toast="canvas-origin"]')).toBeTruthy();
			expect(container.textContent).toContain('YOU ARE IN THE TERMINAL.');
		});

		it('stays quiet on a direct visit', async () => {
			window.history.replaceState({}, '', '/terminal/experience');
			setPageUrl('/terminal/experience');

			const { container } = render(Layout);
			await act();

			expect(container.querySelector('[data-toast]')).toBeNull();
		});

		it('trusts the address bar over the stored page url, so a dismissed notice stays gone', async () => {
			// Kit keeps its own copy of the page url, which still names the canvas after
			// a dismissal rewrites the address bar, so the layout must read the address.
			window.history.replaceState({}, '', '/terminal/experience');
			setPageUrl('/terminal/experience', '?from=canvas');

			const { container } = render(Layout);
			await act();

			expect(container.querySelector('[data-toast]')).toBeNull();
		});

		it('sits directly above the navbar, so it never covers the navigation', async () => {
			const { container } = render(Layout);
			await act();

			const toast = container.querySelector('[data-toast="canvas-origin"]');

			expect(getNavbar(container).previousElementSibling?.contains(toast as Node)).toBe(true);
		});

		it('clears the marker from the address when dismissed', async () => {
			const { container } = render(Layout);
			await act();

			await fireEvent.click(
				container.querySelector('[aria-label="Dismiss notice"]') as HTMLElement
			);

			expect(getReplaceStateCalls()).toHaveLength(1);
			expect(getReplaceStateCalls()[0]?.url).not.toContain('from=');
		});
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

		it('keeps the background effects out of the content layer', async () => {
			stubViewportWidth(true);

			const { container } = render(Layout);
			await act();

			expect(getBackgroundCanvases(getRoot(container))).toHaveLength(0);
			expect(getBackgroundCanvases(container)).toHaveLength(2);
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
