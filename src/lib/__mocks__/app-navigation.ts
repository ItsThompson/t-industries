import type { AfterNavigate } from '@sveltejs/kit';

type AfterNavigateCallback = (navigation: AfterNavigate) => void;

const callbacks: AfterNavigateCallback[] = [];

export function afterNavigate(callback: AfterNavigateCallback): void {
	callbacks.push(callback);
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
