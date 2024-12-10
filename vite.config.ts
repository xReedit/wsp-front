import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [
		sveltekit()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	define: { 'process.env': {} },
	build: {
        terserOptions: {
            compress: {
                drop_console: true
            }
        }
    }
};

export default config;

// import { sveltekit } from '@sveltejs/kit/vite';
// import { defineConfig } from 'vite';

// export default defineConfig({
// 	plugins: [
// 		sveltekit()
// 	],
// 	test: {
// 		include: ['src/**/*.{test,spec}.{js,ts}']
// 	},
// 	define: { 'process.env': {} }
// });
