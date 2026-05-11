import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import NavBar from './NavBar.svelte';

describe('NavBar', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders a Manifest nav item linking to /manifest', () => {
		const { container } = render(NavBar);
		const links = container.querySelectorAll('a');
		const manifestLink = Array.from(links).find(
			(link) => link.textContent?.trim() === 'Manifest'
		);
		expect(manifestLink).not.toBeUndefined();
		expect(manifestLink?.getAttribute('href')).toBe('/manifest');
	});

	it('renders all five navigation items', () => {
		const { container } = render(NavBar);
		const links = container.querySelectorAll('a');
		expect(links.length).toBe(5);
	});

	it('uses border-secondary-200 on the container', () => {
		const { container } = render(NavBar);
		const div = container.querySelector('div');
		expect(div?.classList.contains('border-secondary-200')).toBe(true);
	});

	it('preserves flex-wrap class for mobile responsiveness', () => {
		const { container } = render(NavBar);
		const ul = container.querySelector('ul');
		expect(ul?.classList.contains('flex-wrap')).toBe(true);
	});

	it('renders Home, Experience, Projects, &et, and Manifest links', () => {
		const { container } = render(NavBar);
		const links = container.querySelectorAll('a');
		const texts = Array.from(links).map((link) => link.textContent?.trim());
		expect(texts).toContain('Home');
		expect(texts).toContain('Experience');
		expect(texts).toContain('Projects');
		expect(texts).toContain('&et');
		expect(texts).toContain('Manifest');
	});

	it('does not use position: fixed', () => {
		const { container } = render(NavBar);
		const div = container.querySelector('div');
		expect(div?.classList.contains('fixed')).toBe(false);
	});
});
