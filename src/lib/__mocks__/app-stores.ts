import { writable } from 'svelte/store';

export const page = writable({ url: { pathname: '/' }, route: { id: '/' as string | null } });

export function setPageRoute(routeId: string | null): void {
	page.set({ url: { pathname: routeId ?? '/' }, route: { id: routeId } });
}

export function resetPageRoute(): void {
	setPageRoute('/');
}
