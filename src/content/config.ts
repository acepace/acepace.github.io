import { defineCollection, z } from 'astro:content';

const listField = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value
      .split(/[ ,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  });

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: listField,
    categories: listField,
    draft: z.boolean().optional()
  })
});

export const collections = { blog };
