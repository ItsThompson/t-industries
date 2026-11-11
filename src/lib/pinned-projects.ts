import { GH_PINNED_TOKEN } from '$env/static/private';
import { fetchPinnedRepos, type PinnedProject } from './github';

export async function loadPinnedProjects(fetchFn: typeof fetch): Promise<PinnedProject[]> {
	if (!GH_PINNED_TOKEN) {
		throw new Error(
			'GH_PINNED_TOKEN is not set. Create a GitHub PAT with read:user scope and add it to your .env file.'
		);
	}

	return fetchPinnedRepos(GH_PINNED_TOKEN, fetchFn);
}
