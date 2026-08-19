import { Router } from 'express';
import { findOrCreateConversation, getUserConversations, getMessagesForConversation, getConversationById } from '../controllers/chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { writeLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Inicia ou encontra uma conversa
router.post('/conversations', authenticateToken, writeLimiter, findOrCreateConversation);

// Busca a lista de conversas do usuário
router.get('/conversations', authenticateToken, getUserConversations);

// Busca o histórico de mensagens de uma conversa
router.get('/conversations/:conversationId/messages', authenticateToken, getMessagesForConversation);

router.get('/conversations/:conversationId', authenticateToken, getConversationById);

export default router;