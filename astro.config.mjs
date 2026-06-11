import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';

export default defineConfig({
  integrations: [mdx(), svelte(), sitemap()],
  site: process.env.SITE_URL ?? 'http://localhost:4321'
});

