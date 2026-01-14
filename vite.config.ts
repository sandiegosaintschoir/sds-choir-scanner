import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import fs from 'fs';

export default defineConfig({
	server: {
		host: '0.0.0.0',
		port: 5173,

		https:
			process.env.NODE_ENV === 'development'
				? {
						key: fs.readFileSync('./certs/parkernilson-macbook.local+1-key.pem'),
						cert: fs.readFileSync('./certs/parkernilson-macbook.local+1.pem')
					}
				: undefined
	},

	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],

	test: {
		expect: { requireAssertions: true },

		projects: [
			{
				extends: './vite.config.ts',

				test: {
					name: 'client',

					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},

					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',

				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
