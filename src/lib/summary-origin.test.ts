import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { getReplaceStateCalls, resetReplaceState } from '$lib/__mocks__/app-navigation';
import {
	ORIGIN_PARAM,
	SUMMARY_ORIGIN,
	SUMMARY_PATH,
	clearSummaryOrigin,
	isFromSummary,
	summaryHref,
	withSummaryOrigin
} from './summary-origin';

function pageUrl(search = ''): URL {
	return new URL(`https://thompsontong.com/ethos${search}`);
}

function visit(address: string): void {
	window.history.replaceState({}, '', address);
}

describe('summaryHref', () => {
	it('points at the summary route', () => {
		expect(summaryHref()).toBe(SUMMARY_PATH);
		expect(SUMMARY_PATH).toBe('/one-pager');
	});
});

describe('withSummaryOrigin', () => {
	it('marks a bare path', () => {
		expect(withSummaryOrigin('/experience')).toBe('/experience?from=summary');
	});

	it('keeps a query the destination already carries', () => {
		expect(withSummaryOrigin('/ethos?highlight=msd')).toBe('/ethos?highlight=msd&from=summary');
	});

	it('uses the documented parameter name and value', () => {
		expect(ORIGIN_PARAM).toBe('from');
		expect(SUMMARY_ORIGIN).toBe('summary');
	});
});

describe('isFromSummary', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('recognises the marker', () => {
		expect(isFromSummary(pageUrl('?from=summary'))).toBe(true);
	});

	it('recognises the marker next to another parameter', () => {
		expect(isFromSummary(pageUrl('?highlight=msd&from=summary'))).toBe(true);
	});

	it('treats a missing marker as a direct visit', () => {
		expect(isFromSummary(pageUrl())).toBe(false);
	});

	it('ignores a marker with another value', () => {
		expect(isFromSummary(pageUrl('?from=elsewhere'))).toBe(false);
	});

	it('reads no marker outside the browser, where prerendered urls throw', () => {
		vi.stubGlobal('window', undefined);
		const url = pageUrl('?from=summary');
		Object.defineProperty(url, 'searchParams', {
			get() {
				throw new Error('Cannot access url.searchParams on a page with prerendering enabled');
			}
		});

		expect(isFromSummary(url)).toBe(false);
	});
});

describe('clearSummaryOrigin', () => {
	beforeEach(() => {
		resetReplaceState();
	});

	afterEach(() => {
		visit('/');
		resetReplaceState();
	});

	it('rewrites the address without the marker', () => {
		visit('/experience?from=summary');

		clearSummaryOrigin();

		const [call] = getReplaceStateCalls();
		expect(call?.url).toContain('/experience');
		expect(call?.url).not.toContain(`${ORIGIN_PARAM}=`);
	});

	it('leaves the other parameters alone', () => {
		visit('/ethos?highlight=msd&from=summary');

		clearSummaryOrigin();

		expect(getReplaceStateCalls()[0]?.url).toContain('highlight=msd');
	});

	it('rewrites nothing when the marker is already gone', () => {
		visit('/experience');

		clearSummaryOrigin();

		expect(getReplaceStateCalls()).toHaveLength(0);
	});
});
