import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/static/private', () => ({
	GH_PINNED_TOKEN: 'test-token'
}));

vi.mock('$lib/github', () => ({
	fetchPinnedRepos: vi.fn()
}));

import { load } from './+page.server';
import { fetchPinnedRepos } from '$lib/github';

const mockFetchPinnedRepos = vi.mocked(fetchPinnedRepos);

function createMockEvent(overrides = {}) {
	return {
		fetch: vi.fn(),
		...overrides
	} as unknown as Parameters<typeof load>[0];
}

describe('manifest +page.server load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns projects from fetchPinnedRepos on success', async () => {
		const mockProjects = [
			{
				name: 'project-one',
				description: 'First project',
				githubUrl: 'https://github.com/ItsThompson/project-one',
				homepageUrl: '',
				primaryLanguage: { name: 'TypeScript', color: '#3178c6' }
			}
		];

		mockFetchPinnedRepos.mockResolvedValue(mockProjects);

		const event = createMockEvent();
		const result = await load(event);

		expect(result).toEqual({
			projects: mockProjects,
			projectsError: false
		});
		expect(mockFetchPinnedRepos).toHaveBeenCalledWith('test-token', event.fetch);
	});

	it('returns empty projects array with error flag when fetchPinnedRepos throws', async () => {
		mockFetchPinnedRepos.mockRejectedValue(new Error('API failure'));

		const event = createMockEvent();
		const result = await load(event);

		expect(result).toEqual({
			projects: [],
			projectsError: true
		});
	});

	it('calls fetchPinnedRepos with the event fetch function', async () => {
		mockFetchPinnedRepos.mockResolvedValue([]);
		const customFetch = vi.fn();
		const event = createMockEvent({ fetch: customFetch });

		await load(event);

		expect(mockFetchPinnedRepos).toHaveBeenCalledWith('test-token', customFetch);
	});
});
