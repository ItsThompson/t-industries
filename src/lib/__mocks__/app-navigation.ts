import type { AfterNavigate } from '@sveltejs/kit';

type AfterNavigateCallback = (navigation: AfterNavigate) => void;

const callbacks: AfterNavigateCallback[] = [];

export interface ReplaceStateCall {
	url: string;
	state: unknown;
}

const replaceStateCalls: ReplaceStateCall[] = [];

export function afterNavigate(callback: AfterNavigateCallback): void {
	callbacks.push(callback);
}

/** Records the call only: the real helper rewrites history but leaves `$page.url` alone. */
export function replaceState(url: string | URL, state?: unknown): void {
	replaceStateCalls.push({ url: url.toString(), state });
}

export function getReplaceStateCalls(): ReplaceStateCall[] {
	return [...replaceStateCalls];
}

export function resetReplaceState(): void {
	replaceStateCalls.length = 0;
}

export function triggerAfterNavigate(navigation: AfterNavigate = buildAfterNavigate()): void {
	callbacks.forEach((callback) => callback(navigation));
}

export function resetAfterNavigate(): void {
	callbacks.length = 0;
}

export function buildAfterNavigate(overrides: Partial<AfterNavigate> = {}): AfterNavigate {
	return {
		from: null,
		to: {
			params: {},
			route: { id: '/' },
			url: new URL('http://localhost/')
		},
		type: 'link',
		willUnload: false,
		complete: Promise.resolve(),
		...overrides
	};
}
