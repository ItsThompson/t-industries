import { describe, it, expect, vi } from 'vitest';
import { fetchPinnedRepos } from './github';
import type { PinnedProject } from './github';

function createMockResponse(body: unknown, status = 200): Response {
	return {
		ok: status >= 200 && status < 300,
		status,
		text: () => Promise.resolve(JSON.stringify(body)),
		json: () => Promise.resolve(body)
	} as Response;
}

function createSuccessBody(
	nodes: Array<{
		name: string;
		description: string | null;
		url: string;
		homepageUrl: string | null;
		primaryLanguage: { name: string; color: string } | null;
	}>
) {
	return {
		data: {
			user: {
				pinnedItems: { nodes }
			}
		}
	};
}

describe('fetchPinnedRepos', () => {
	it('returns an array of PinnedProject objects for a valid response', async () => {
		const mockNodes = [
			{
				name: 'my-project',
				description: 'A cool project',
				url: 'https://github.com/ItsThompson/my-project',
				homepageUrl: 'https://my-project.dev',
				primaryLanguage: { name: 'TypeScript', color: '#3178c6' }
			},
			{
				name: 'another-repo',
				description: 'Another project',
				url: 'https://github.com/ItsThompson/another-repo',
				homepageUrl: null,
				primaryLanguage: { name: 'Go', color: '#00ADD8' }
			}
		];

		const mockFetch = vi.fn().mockResolvedValue(createMockResponse(createSuccessBody(mockNodes)));

		const result = await fetchPinnedRepos('valid-token', mockFetch);

		expect(result).toEqual<PinnedProject[]>([
			{
				name: 'my-project',
				description: 'A cool project',
				githubUrl: 'https://github.com/ItsThompson/my-project',
				homepageUrl: 'https://my-project.dev',
				primaryLanguage: { name: 'TypeScript', color: '#3178c6' }
			},
			{
				name: 'another-repo',
				description: 'Another project',
				githubUrl: 'https://github.com/ItsThompson/another-repo',
				homepageUrl: '',
				primaryLanguage: { name: 'Go', color: '#00ADD8' }
			}
		]);

		expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/graphql', {
			method: 'POST',
			headers: {
				Authorization: 'Bearer valid-token',
				'Content-Type': 'application/json'
			},
			body: expect.stringContaining('pinnedItems')
		});
	});

	it('returns an empty array when user has no pinned repos', async () => {
		const mockFetch = vi.fn().mockResolvedValue(createMockResponse(createSuccessBody([])));

		const result = await fetchPinnedRepos('valid-token', mockFetch);

		expect(result).toEqual([]);
	});

	it('handles repos with null description and primaryLanguage', async () => {
		const mockNodes = [
			{
				name: 'bare-repo',
				description: null,
				url: 'https://github.com/ItsThompson/bare-repo',
				homepageUrl: null,
				primaryLanguage: null
			}
		];

		const mockFetch = vi.fn().mockResolvedValue(createMockResponse(createSuccessBody(mockNodes)));

		const result = await fetchPinnedRepos('valid-token', mockFetch);

		expect(result).toEqual<PinnedProject[]>([
			{
				name: 'bare-repo',
				description: '',
				githubUrl: 'https://github.com/ItsThompson/bare-repo',
				homepageUrl: '',
				primaryLanguage: null
			}
		]);
	});

	it('throws with status code on non-200 response', async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValue(createMockResponse({ message: 'Bad credentials' }, 401));

		await expect(fetchPinnedRepos('invalid-token', mockFetch)).rejects.toThrow(
			'GitHub API request failed (status 401)'
		);
	});

	it('throws on GraphQL errors in the response body', async () => {
		const errorBody = {
			errors: [{ message: 'Field "user" not found' }]
		};

		const mockFetch = vi.fn().mockResolvedValue(createMockResponse(errorBody));

		await expect(fetchPinnedRepos('valid-token', mockFetch)).rejects.toThrow(
			'GitHub GraphQL errors: Field "user" not found'
		);
	});

	it('throws when response has no data field', async () => {
		const mockFetch = vi.fn().mockResolvedValue(createMockResponse({}));

		await expect(fetchPinnedRepos('valid-token', mockFetch)).rejects.toThrow(
			'GitHub API returned no data'
		);
	});

	it('throws a descriptive error on network failure', async () => {
		const mockFetch = vi.fn().mockRejectedValue(new Error('Network request failed'));

		await expect(fetchPinnedRepos('valid-token', mockFetch)).rejects.toThrow(
			'Network request failed'
		);
	});
});
