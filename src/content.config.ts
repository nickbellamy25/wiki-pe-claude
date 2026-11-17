import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().default(0),
    // Closed set, not a free string: a typo here would otherwise pass validation
    // and produce a page that renders but never appears in any nav section.
    section: z.enum([
      'Best practices',
      'Claude Code welcome',
      'Context',
      'Executing at scale',
      'Foundations',
      'Getting started',
      'PE Playbooks',
      'PE use cases',
      'Power features',
      'Projects',
      'Resources',
      'Start Here',
      'Worked example',
    ]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs };
