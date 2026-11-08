import { base } from '$app/paths';

/** Query parameter that names the element a route should reveal. */
export const HIGHLIGHT_PARAM = 'highlight';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Builds a link to `path` that asks the target route to reveal `targetId`.
 */
export function highlightHref(path: string, targetId: string): string {
	return `${base}${path}?${HIGHLIGHT_PARAM}=${encodeURIComponent(targetId)}`;
}

/**
 * Reads the reveal target from a route's search params. Returns null when the
 * param is absent or blank, so callers can treat "no target" as one case.
 */
export function readHighlightTarget(
	searchParams: URLSearchParams | null | undefined
): string | null {
	const target = searchParams?.get(HIGHLIGHT_PARAM)?.trim();
	return target ? target : null;
}

export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia(REDUCED_MOTION_QUERY).matches
	);
}

/**
 * Centers the element with the given id inside its scroll container. The site
 * scrolls a nested region rather than the window, so the browser resolves the
 * container from the element itself.
 */
export function scrollToCenter(elementId: string): void {
	if (typeof document === 'undefined') return;

	const element = document.getElementById(elementId);
	if (!element || typeof element.scrollIntoView !== 'function') return;

	element.scrollIntoView({
		block: 'center',
		inline: 'nearest',
		behavior: prefersReducedMotion() ? 'auto' : 'smooth'
	});
}

/**
 * Centers the element on the next frame. Routes defer the reveal by one frame
 * because the layout resets the scroll region during the same navigation tick,
 * which would otherwise cancel the scroll.
 */
export function revealElement(elementId: string): void {
	const scroll = (): void => scrollToCenter(elementId);

	if (typeof requestAnimationFrame === 'function') {
		requestAnimationFrame(scroll);
		return;
	}

	scroll();
}
