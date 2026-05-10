import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import FeaturedProjectItem from './FeaturedProjectItem.svelte';

describe('FeaturedProjectItem', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders the project name and description', () => {
		const { getByText } = render(FeaturedProjectItem, {
			props: {
				github: 'https://github.com/ItsThompson/my-project',
				name: 'My Project',
				desc: 'A great project description'
			}
		});

		expect(getByText('My Project')).toBeTruthy();
		expect(getByText('A great project description')).toBeTruthy();
	});

	it('renders a GitHub badge linking to the repo', () => {
		const { container } = render(FeaturedProjectItem, {
			props: {
				github: 'https://github.com/ItsThompson/my-project',
				name: 'My Project'
			}
		});

		const link = container.querySelector('a[href="https://github.com/ItsThompson/my-project"]');
		expect(link).not.toBeNull();
		expect(link?.textContent).toContain('GitHub');
	});

	it('renders a Website badge when website prop is provided', () => {
		const { getByText } = render(FeaturedProjectItem, {
			props: {
				github: 'https://github.com/ItsThompson/my-project',
				name: 'My Project',
				website: 'https://my-project.dev'
			}
		});

		const badge = getByText(/Website/);
		const link = badge.closest('a');
		expect(link?.getAttribute('href')).toBe('https://my-project.dev');
	});

	it('does not render a Website badge when website prop is empty', () => {
		const { queryByText } = render(FeaturedProjectItem, {
			props: {
				github: 'https://github.com/ItsThompson/my-project',
				name: 'My Project',
				website: ''
			}
		});

		expect(queryByText(/Website/)).toBeNull();
	});

	it('renders the language name and colored dot when language is provided', () => {
		const { getByText, container } = render(FeaturedProjectItem, {
			props: {
				github: 'https://github.com/ItsThompson/my-project',
				name: 'My Project',
				language: 'TypeScript',
				languageColor: '#3178c6'
			}
		});

		expect(getByText('TypeScript')).toBeTruthy();

		const dot = container.querySelector('span[style*="background-color"]');
		expect(dot).not.toBeNull();
		expect(dot?.getAttribute('style')).toMatch(/background-color/);
	});

	it('does not render a language indicator when language is empty', () => {
		const { container } = render(FeaturedProjectItem, {
			props: {
				github: 'https://github.com/ItsThompson/my-project',
				name: 'My Project',
				language: '',
				languageColor: ''
			}
		});

		const dot = container.querySelector('span[style*="background-color"]');
		expect(dot).toBeNull();

		const languageLabel = container.querySelector('.text-gray-300');
		expect(languageLabel).toBeNull();
	});
});
