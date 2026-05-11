import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import NavItem from './NavItem.svelte';

describe('NavItem', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders an anchor with the given href', () => {
		const { container } = render(NavItem, { props: { href: '/test', text: 'Test' } });
		const link = container.querySelector('a');
		expect(link?.getAttribute('href')).toBe('/test');
	});

	it('renders the given text', () => {
		const { container } = render(NavItem, { props: { href: '/test', text: 'Test Page' } });
		const link = container.querySelector('a');
		expect(link?.textContent?.trim()).toBe('Test Page');
	});

	it('applies uppercase class to the anchor', () => {
		const { container } = render(NavItem, { props: { href: '/test', text: 'Test' } });
		const link = container.querySelector('a');
		expect(link?.classList.contains('uppercase')).toBe(true);
	});

	it('applies tracking-wider class to the anchor', () => {
		const { container } = render(NavItem, { props: { href: '/test', text: 'Test' } });
		const link = container.querySelector('a');
		expect(link?.classList.contains('tracking-wider')).toBe(true);
	});

	it('wraps the anchor in an li element', () => {
		const { container } = render(NavItem, { props: { href: '/test', text: 'Test' } });
		const li = container.querySelector('li');
		expect(li).not.toBeNull();
		const link = li?.querySelector('a');
		expect(link).not.toBeNull();
	});

	it('applies hover:text-primary class', () => {
		const { container } = render(NavItem, { props: { href: '/test', text: 'Test' } });
		const link = container.querySelector('a');
		expect(link?.classList.contains('hover:text-primary')).toBe(true);
	});

	it('applies text-primary when href matches current page pathname', () => {
		// The mock for $app/stores sets page.url.pathname to '/'
		const { container } = render(NavItem, { props: { href: '/', text: 'Home' } });
		const link = container.querySelector('a');
		expect(link?.classList.contains('text-primary')).toBe(true);
	});

	it('does not apply text-primary when href does not match current page', () => {
		const { container } = render(NavItem, { props: { href: '/other', text: 'Other' } });
		const link = container.querySelector('a');
		expect(link?.classList.contains('text-primary')).toBe(false);
	});
});
