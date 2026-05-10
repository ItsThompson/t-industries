import { GH_PINNED_TOKEN } from '$env/static/private';
import { fetchPinnedRepos } from '$lib/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	if (!GH_PINNED_TOKEN) {
		throw new Error(
			'GH_PINNED_TOKEN is not set. Create a GitHub PAT with read:user scope and add it to your .env file.'
		);
	}

	const projects = await fetchPinnedRepos(GH_PINNED_TOKEN, fetch);

	return { projects };
};
