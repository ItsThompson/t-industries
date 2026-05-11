import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import SectionNav from './SectionNav.svelte';

describe('SectionNav', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders a nav element with aria-label', () => {
		const { container } = render(SectionNav);
		const nav = container.querySelector('nav');
		expect(nav).not.toBeNull();
		expect(nav?.getAttribute('aria-label')).toBe('Page sections');
	});

	it('renders anchor links for all four sections', () => {
		const { container } = render(SectionNav);
		const links = container.querySelectorAll('a');
		expect(links.length).toBe(4);
	});

	it('renders links with correct href anchors', () => {
		const { container } = render(SectionNav);
		const links = container.querySelectorAll('a');
		const hrefs = Array.from(links).map((link) => link.getAttribute('href'));
		expect(hrefs).toContain('#identity');
		expect(hrefs).toContain('#experience');
		expect(hrefs).toContain('#projects');
		expect(hrefs).toContain('#ethos');
	});

	it('renders labels for Identity, Experience, Projects, and Ethos', () => {
		const { container } = render(SectionNav);
		const links = container.querySelectorAll('a');
		const texts = Array.from(links).map((link) => link.textContent?.trim());
		expect(texts).toContain('Identity');
		expect(texts).toContain('Experience');
		expect(texts).toContain('Projects');
		expect(texts).toContain('Ethos');
	});

	it('applies uppercase and tracking-wider to all links', () => {
		const { container } = render(SectionNav);
		const links = container.querySelectorAll('a');
		links.forEach((link) => {
			expect(link.classList.contains('uppercase')).toBe(true);
			expect(link.classList.contains('tracking-wider')).toBe(true);
		});
	});

	it('highlights the active section with text-primary', () => {
		const { container } = render(SectionNav, { props: { activeSection: 'experience' } });
		const links = container.querySelectorAll('a');
		const experienceLink = Array.from(links).find(
			(link) => link.getAttribute('href') === '#experience'
		);
		expect(experienceLink?.classList.contains('text-primary')).toBe(true);
	});

	it('does not highlight inactive sections with text-primary', () => {
		const { container } = render(SectionNav, { props: { activeSection: 'experience' } });
		const links = container.querySelectorAll('a');
		const identityLink = Array.from(links).find(
			(link) => link.getAttribute('href') === '#identity'
		);
		expect(identityLink?.classList.contains('text-primary')).toBe(false);
	});

	it('applies text-secondary-200 to inactive sections', () => {
		const { container } = render(SectionNav, { props: { activeSection: 'projects' } });
		const links = container.querySelectorAll('a');
		const identityLink = Array.from(links).find(
			(link) => link.getAttribute('href') === '#identity'
		);
		expect(identityLink?.classList.contains('text-secondary-200')).toBe(true);
	});

	it('handles empty activeSection (no section highlighted)', () => {
		const { container } = render(SectionNav, { props: { activeSection: '' } });
		const links = container.querySelectorAll('a');
		links.forEach((link) => {
			expect(link.classList.contains('text-primary')).toBe(false);
			expect(link.classList.contains('text-secondary-200')).toBe(true);
		});
	});
});
