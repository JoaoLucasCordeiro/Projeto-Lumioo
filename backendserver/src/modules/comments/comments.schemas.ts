import { z } from 'zod';

export const commentSchema = z.object({
  text: z.string().min(1, 'Comment text is required.').max(500),
});

export type CommentInput = z.infer<typeof commentSchema>;
