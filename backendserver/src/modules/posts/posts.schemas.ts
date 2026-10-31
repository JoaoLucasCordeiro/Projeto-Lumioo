import { z } from 'zod';

export const createPostSchema = z.object({
  caption: z.string().min(1).max(2000),
  image: z.string().optional(),
  location: z.string().max(200).optional(),
  hashtags: z.array(z.string()).optional().default([]),
});

// Edição parcial: só o que vier é alterado; `null` remove imagem e local.
export const updatePostSchema = z.object({
  caption: z.string().min(1).max(2000).optional(),
  image: z.string().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  hashtags: z.array(z.string()).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
