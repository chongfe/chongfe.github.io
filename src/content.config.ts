import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const common = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  order: z.number().default(100),
});

const blog = defineCollection({ loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }), schema: common });
const docs = defineCollection({ loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }), schema: common });
const research = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/research' }),
  schema: common.extend({
    kind: z.enum(['direction', 'paper', 'project', 'note']).default('note'),
    status: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.url({ protocol: /^https?$/ }) })).default([]),
  }),
});
export const collections = { blog, docs, research };
