import { Router } from 'express';
import {
  createWork,
  getAllWorks,
  getWorkById,
  updateWork,
  deleteWork,
  downloadWorkById,
  requestWorkAccess,
  getWorkAccessRequests,
  respondToWorkAccessRequest,
  getMyWorkAccessRequests,
  getWorkStats,
  getWorkFieldSuggestions,
} from '../controllers/work.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { optionalAuthenticateToken } from '../middlewares/optionalAuth.middleware';
import { writeLimiter } from '../middlewares/rateLimit.middleware';
import { validateBody } from '../lib/validate';
import { createWorkSchema, updateWorkSchema, respondWorkAccessRequestSchema } from '../lib/schemas';

const router = Router();

// Rotas públicas (com filtro de visibilidade aplicado quando autenticado)
router.post('/works', authenticateToken, writeLimiter, validateBody(createWorkSchema), createWork);
router.get('/works', optionalAuthenticateToken, getAllWorks);

// --- ESTATÍSTICAS/AGREGAÇÃO E SUGESTÕES (precisam vir antes de /works/:id) ---
router.get('/works/stats', getWorkStats);
router.get('/works/suggestions', getWorkFieldSuggestions);

router.get('/works/access-requests/mine', authenticateToken, getMyWorkAccessRequests);
router.get('/works/:id', optionalAuthenticateToken, getWorkById);
router.put('/works/:id', authenticateToken, validateBody(updateWorkSchema), updateWork);
router.delete('/works/:id', authenticateToken, deleteWork);

// --- ROTA DE DOWNLOAD ---
router.get('/works/:id/download', authenticateToken, downloadWorkById);

// --- PEDIDOS DE ACESSO A TRABALHOS PRIVADOS ---
router.post('/works/:id/access-requests', authenticateToken, writeLimiter, requestWorkAccess);
router.get('/works/:id/access-requests', authenticateToken, getWorkAccessRequests);
router.patch(
  '/works/:id/access-requests/:requestId',
  authenticateToken,
  validateBody(respondWorkAccessRequestSchema),
  respondToWorkAccessRequest
);

export default router;