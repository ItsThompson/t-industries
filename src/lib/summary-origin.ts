import { base } from '$app/paths';
import { replaceState } from '$app/navigation';
import { get } from 'svelte/store';
import { page } from '$app/stores';

/** Query parameter that marks a link as leaving the summary for the terminal. */
export const ORIGIN_PARAM = 'from';

export const SUMMARY_ORIGIN = 'summary';

export const SUMMARY_PATH = '/one-pager';

export function summaryHref(): string {
	return `${base}${SUMMARY_PATH}`;
}

/**
 * Appends the origin marker without dropping a query the destination already
 * carries, so the ethos links keep their `?highlight=` target.
 */
export function withSummaryOrigin(href: string): string {
	const separator = href.includes('?') ? '&' : '?';
	return `${href}${separator}${ORIGIN_PARAM}=${SUMMARY_ORIGIN}`;
}

/** A prerendered page has no query string and throws on `url.searchParams`. */
export function isFromSummary(url: URL): boolean {
	if (typeof window === 'undefined') return false;

	return url.searchParams.get(ORIGIN_PARAM) === SUMMARY_ORIGIN;
}

/**
 * Removes the marker through the history API rather than a navigation, so the
 * scroll region keeps its position and the reader stays on the same entry.
 */
export function clearSummaryOrigin(): void {
	if (typeof window === 'undefined') return;

	const url = new URL(window.location.href);
	if (!url.searchParams.has(ORIGIN_PARAM)) return;

	url.searchParams.delete(ORIGIN_PARAM);
	replaceState(url, get(page).state);
}
