import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, act } from '@testing-library/svelte';
import Layout from './+layout.svelte';
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

	it('lets the scroll region grow to the space the navbar leaves', async () => {
		const { container } = render(Layout);
		await act();

		const region = getScrollRegion(container);
		expect(region.classList.contains('flex-1')).toBe(true);
		expect(region.classList.contains('min-h-0')).toBe(true);
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

	it('centers short content on desktop and keeps overflowing content top-aligned', async () => {
		const { container } = render(Layout);
		await act();

		const content = getScrollRegion(container).firstElementChild;
		expect(content?.classList.contains('justify-start')).toBe(true);
		expect(content?.classList.contains('md:justify-center')).toBe(true);
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
});
