import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { getReplaceStateCalls, resetReplaceState } from '$lib/__mocks__/app-navigation';
import { CANVAS_PATH } from './routes';
import {
	ORIGIN_PARAM,
	CANVAS_ORIGIN,
	clearCanvasOrigin,
	isFromCanvas,
	canvasHref,
	withCanvasOrigin
} from './canvas-origin';

function pageUrl(search = ''): URL {
	return new URL(`https://thompsontong.com/terminal/ethos${search}`);
}

function visit(address: string): void {
	window.history.replaceState({}, '', address);
}

describe('canvasHref', () => {
	it('points at the canvas route', () => {
		expect(canvasHref()).toBe(CANVAS_PATH);
		expect(CANVAS_PATH).toBe('/');
	});
});

describe('withCanvasOrigin', () => {
	it('marks a bare path', () => {
		expect(withCanvasOrigin('/terminal/experience')).toBe('/terminal/experience?from=canvas');
	});

	it('keeps a query the destination already carries', () => {
		expect(withCanvasOrigin('/terminal/ethos?highlight=msd')).toBe(
			'/terminal/ethos?highlight=msd&from=canvas'
		);
	});

	it('uses the documented parameter name and value', () => {
		expect(ORIGIN_PARAM).toBe('from');
		expect(CANVAS_ORIGIN).toBe('canvas');
	});
});

describe('isFromCanvas', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('recognises the marker', () => {
		expect(isFromCanvas(pageUrl('?from=canvas'))).toBe(true);
	});

	it('recognises the marker next to another parameter', () => {
		expect(isFromCanvas(pageUrl('?highlight=msd&from=canvas'))).toBe(true);
	});

	it('treats a missing marker as a direct visit', () => {
		expect(isFromCanvas(pageUrl())).toBe(false);
	});

	it('ignores a marker with another value', () => {
		expect(isFromCanvas(pageUrl('?from=elsewhere'))).toBe(false);
	});

	it('reads no marker outside the browser, where prerendered urls throw', () => {
		vi.stubGlobal('window', undefined);
		const url = pageUrl('?from=canvas');
		Object.defineProperty(url, 'searchParams', {
			get() {
				throw new Error('Cannot access url.searchParams on a page with prerendering enabled');
			}
		});

		expect(isFromCanvas(url)).toBe(false);
	});
});

describe('clearCanvasOrigin', () => {
	beforeEach(() => {
		resetReplaceState();
	});

	afterEach(() => {
		visit('/');
		resetReplaceState();
	});

	it('rewrites the address without the marker', () => {
		visit('/terminal/experience?from=canvas');

		clearCanvasOrigin();

		const [call] = getReplaceStateCalls();
		expect(call?.url).toContain('/terminal/experience');
		expect(call?.url).not.toContain(`${ORIGIN_PARAM}=`);
	});

	it('leaves the other parameters alone', () => {
		visit('/terminal/ethos?highlight=msd&from=canvas');

		clearCanvasOrigin();

		expect(getReplaceStateCalls()[0]?.url).toContain('highlight=msd');
	});

	it('rewrites nothing when the marker is already gone', () => {
		visit('/terminal/experience');

		clearCanvasOrigin();

		expect(getReplaceStateCalls()).toHaveLength(0);
	});
});
