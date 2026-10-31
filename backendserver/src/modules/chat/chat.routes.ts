import { Router } from 'express';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';
import { writeLimiter } from '../../shared/middlewares/rateLimit.middleware';
import { validateBody } from '../../shared/middlewares/validate.middleware';
import {
  findOrCreateConversation, getConversationById, getMessagesForConversation, getUserConversations,
} from './chat.controller';
import { createConversationSchema } from './chat.schemas';

const router = Router();

router.post('/conversations', authenticateToken, writeLimiter, validateBody(createConversationSchema), findOrCreateConversation);
router.get('/conversations', authenticateToken, getUserConversations);
router.get('/conversations/:conversationId', authenticateToken, getConversationById);
router.get('/conversations/:conversationId/messages', authenticateToken, getMessagesForConversation);

export default router;
