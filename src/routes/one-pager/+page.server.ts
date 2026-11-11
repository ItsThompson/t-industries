import { loadPinnedProjects } from '$lib/pinned-projects';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const projects = await loadPinnedProjects(fetch);

	return { projects };
};
