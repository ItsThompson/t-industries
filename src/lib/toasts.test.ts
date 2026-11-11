import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { getReplaceStateCalls, resetReplaceState } from '$lib/__mocks__/app-navigation';
import {
	CANVAS_ORIGIN_TOAST_KIND,
	clearToasts,
	dismissToast,
	showToast,
	syncCanvasOriginToast,
	toasts
} from './toasts';

function pageUrl(path: string, search = ''): URL {
	return new URL(`https://thompsontong.com${path}${search}`);
}

function kinds(): string[] {
	return get(toasts).map((toast) => toast.kind);
}

describe('toasts', () => {
	beforeEach(() => {
		clearToasts();
		resetReplaceState();
		window.history.replaceState({}, '', '/');
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('adds one toast per kind', () => {
		showToast(CANVAS_ORIGIN_TOAST_KIND);

		expect(kinds()).toEqual([CANVAS_ORIGIN_TOAST_KIND]);
	});

	it('does not stack duplicates of the same kind', () => {
		showToast(CANVAS_ORIGIN_TOAST_KIND);
		showToast(CANVAS_ORIGIN_TOAST_KIND);

		expect(kinds()).toEqual([CANVAS_ORIGIN_TOAST_KIND]);
	});

	it('gives a toast raised again after dismissal a fresh id, so the keyed block remounts', () => {
		showToast(CANVAS_ORIGIN_TOAST_KIND);
		const firstId = get(toasts)[0]?.id;

		dismissToast(firstId ?? -1);
		showToast(CANVAS_ORIGIN_TOAST_KIND);

		expect(get(toasts)[0]?.id).not.toBe(firstId);
	});

	it('drops a dismissed toast', () => {
		showToast(CANVAS_ORIGIN_TOAST_KIND);
		const id = get(toasts)[0]?.id ?? -1;

		dismissToast(id);

		expect(kinds()).toEqual([]);
	});

	it('ignores an id that is not on screen', () => {
		showToast(CANVAS_ORIGIN_TOAST_KIND);

		dismissToast(999);

		expect(kinds()).toEqual([CANVAS_ORIGIN_TOAST_KIND]);
	});

	it('clears the origin marker from the address when the canvas toast is dismissed', () => {
		window.history.replaceState({}, '', '/terminal/experience?from=canvas');
		syncCanvasOriginToast(pageUrl('/terminal/experience', '?from=canvas'));

		dismissToast(get(toasts)[0]?.id ?? -1);

		expect(getReplaceStateCalls()).toHaveLength(1);
		expect(getReplaceStateCalls()[0]?.url).not.toContain('from=');
	});
});

describe('syncCanvasOriginToast', () => {
	beforeEach(() => {
		clearToasts();
		resetReplaceState();
		window.history.replaceState({}, '', '/');
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('raises the toast when the address names the canvas', () => {
		syncCanvasOriginToast(pageUrl('/terminal/experience', '?from=canvas'));

		expect(kinds()).toEqual([CANVAS_ORIGIN_TOAST_KIND]);
	});

	it('raises nothing on a direct visit', () => {
		syncCanvasOriginToast(pageUrl('/terminal/experience'));

		expect(kinds()).toEqual([]);
	});

	it('is idempotent, so a repeated sync does not stack', () => {
		const url = pageUrl('/terminal/experience', '?from=canvas');

		syncCanvasOriginToast(url);
		syncCanvasOriginToast(url);

		expect(kinds()).toEqual([CANVAS_ORIGIN_TOAST_KIND]);
	});

	it('ends the toast once a navigation drops the marker', () => {
		syncCanvasOriginToast(pageUrl('/terminal/experience', '?from=canvas'));

		syncCanvasOriginToast(pageUrl('/terminal/projects'));

		expect(kinds()).toEqual([]);
	});

	it('leaves the address alone when the marker is already gone', () => {
		syncCanvasOriginToast(pageUrl('/terminal/experience', '?from=canvas'));

		syncCanvasOriginToast(pageUrl('/terminal/projects'));

		expect(getReplaceStateCalls()).toHaveLength(0);
	});
});
