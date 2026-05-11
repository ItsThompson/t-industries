import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import NavBar from './NavBar.svelte';

describe('NavBar', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders all four navigation items', () => {
		const { container } = render(NavBar);
		const links = container.querySelectorAll('a');
		expect(links.length).toBe(4);
	});

	it('renders home, experience, projects, and &et links', () => {
		const { container } = render(NavBar);
		const links = container.querySelectorAll('a');
		const texts = Array.from(links).map((link) => link.textContent?.trim());
		expect(texts).toContain('home');
		expect(texts).toContain('experience');
		expect(texts).toContain('projects');
		expect(texts).toContain('&et');
	});

	it('does not render a manifest link', () => {
		const { container } = render(NavBar);
		const links = container.querySelectorAll('a');
		const texts = Array.from(links).map((link) => link.textContent?.trim());
		expect(texts).not.toContain('manifest');
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

	it('does not use position: fixed', () => {
		const { container } = render(NavBar);
		const div = container.querySelector('div');
		expect(div?.classList.contains('fixed')).toBe(false);
	});
});
