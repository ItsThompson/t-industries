import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	plugins: [
		svelte({ hot: false })
	],
	resolve: {
		conditions: ['browser'],
		alias: {
			$lib: path.resolve(__dirname, 'src/lib'),
			'$env/static/private': path.resolve(__dirname, 'src/lib/__mocks__/env-static-private.ts')
		}
	},
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.ts']
	}
});
