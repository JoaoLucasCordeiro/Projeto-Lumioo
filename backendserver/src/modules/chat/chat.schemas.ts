import { z } from 'zod';

const RECIPIENT_REQUIRED = 'Recipient ID is required.';

export const createConversationSchema = z.object({
  recipientId: z.string(RECIPIENT_REQUIRED).min(1, RECIPIENT_REQUIRED),
});

/** Mensagem enviada pelo socket (evento `sendMessage`). */
export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().trim().min(1, 'Message text is required.').max(2000, 'Message is too long.'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
