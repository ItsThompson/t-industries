import { writable } from 'svelte/store';

const ORIGIN = 'http://localhost';

function buildPageUrl(pathname: string | null, search: string): URL {
	return new URL(`${pathname ?? '/'}${search}`, ORIGIN);
}

export const page = writable({
	url: buildPageUrl('/', ''),
	route: { id: '/' as string | null }
});

export function setPageUrl(pathname: string | null, search = ''): void {
	page.set({
		url: buildPageUrl(pathname, search),
		route: { id: pathname }
	});
}

export function setPageRoute(routeId: string | null): void {
	setPageUrl(routeId);
}

export function resetPageRoute(): void {
	setPageRoute('/');
}
