import { GH_PINNED_TOKEN } from '$env/static/private';
import { fetchPinnedRepos } from '$lib/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		if (!GH_PINNED_TOKEN) {
			return { projects: [], projectsError: true };
		}

		const projects = await fetchPinnedRepos(GH_PINNED_TOKEN, fetch);
		return { projects, projectsError: false };
	} catch {
		return { projects: [], projectsError: true };
	}
};
