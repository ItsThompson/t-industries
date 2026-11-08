import { writable } from 'svelte/store';

export const page = writable({
	url: { pathname: '/', search: '', searchParams: new URLSearchParams() },
	route: { id: '/' as string | null }
});

export function setPageUrl(pathname: string | null, search = ''): void {
	page.set({
		url: { pathname: pathname ?? '/', search, searchParams: new URLSearchParams(search) },
		route: { id: pathname }
	});
}

export function setPageRoute(routeId: string | null): void {
	setPageUrl(routeId);
}

export function resetPageRoute(): void {
	setPageRoute('/');
}
