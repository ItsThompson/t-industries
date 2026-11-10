import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        // The site serves from the root of thompsontong.com, so no base path is
        // set. A base prefix puts every absolute link and asset one segment too
        // deep for that origin.
        adapter: adapter(),
    },
};

export default config;
