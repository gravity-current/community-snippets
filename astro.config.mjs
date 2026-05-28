import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';

export default defineConfig({
  integrations: [mdx(), svelte()],
  site: process.env.SITE_URL ?? 'http://localhost:4321'
});

