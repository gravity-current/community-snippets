import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const entries = defineCollection({
  loader: glob({
    base: './src/content/entries',
    pattern: '**/*.{md,mdx}'
  }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['function', 'snippet', 'write-up']),
    lang: z.enum(['glsl', 'js', 'json', 'none']).default('none'),
    summary: z.string(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    submittedBy: z.string(),
    originalAuthor: z.string().optional(),
    source: z.string().url().optional(),
    license: z.string().default('Unlicensed'),
    example: z.string().url().optional(),
    date: z.coerce.date(),
    featured: z.boolean().default(false),
    cover: z.string().optional()
  })
});

export const collections = {
  entries
};