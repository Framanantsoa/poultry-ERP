import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load .env.test when Vitest runs (mode === 'test')
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tailwindcss(),
      sveltekit({
        compilerOptions: {
          runes: ({ filename }) =>
            filename.split(/[/\\]/).includes('node_modules') ? undefined : true
        },
        adapter: adapter()
      })
    ],
    test: {
      expect: { requireAssertions: true },
      env, // ← inject .env.test into process.env
      include: ['src/**/*.{test,spec}.{js,ts}'],
      exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', '**/node_modules/**'],
      setupFiles: ['./src/tests/setup.ts'],
      pool: 'forks',
      maxWorkers: 1,
      minWorkers: 1
    }
  };
});
