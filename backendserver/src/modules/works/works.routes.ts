import { Router } from 'express';
import { authenticateToken, optionalAuthenticateToken } from '../../shared/middlewares/auth.middleware';
import { writeLimiter } from '../../shared/middlewares/rateLimit.middleware';
import { validateBody } from '../../shared/middlewares/validate.middleware';
import {
  createWork, deleteWork, downloadWorkById, getAllWorks, getMyWorkAccessRequests,
  getWorkAccessRequests, getWorkById, getWorkFieldSuggestions, getWorkStats,
  requestWorkAccess, respondToWorkAccessRequest, updateWork,
} from './works.controller';
import { createWorkSchema, respondWorkAccessRequestSchema, updateWorkSchema } from './works.schemas';

const router = Router();

router.post('/works', authenticateToken, writeLimiter, validateBody(createWorkSchema), createWork);
router.get('/works', optionalAuthenticateToken, getAllWorks);

// Estatísticas, sugestões e "meus pedidos" precisam vir antes de /works/:id
router.get('/works/stats', getWorkStats);
router.get('/works/suggestions', getWorkFieldSuggestions);
router.get('/works/access-requests/mine', authenticateToken, getMyWorkAccessRequests);

router.get('/works/:id', optionalAuthenticateToken, getWorkById);
router.put('/works/:id', authenticateToken, validateBody(updateWorkSchema), updateWork);
router.delete('/works/:id', authenticateToken, deleteWork);
router.get('/works/:id/download', authenticateToken, downloadWorkById);

// Pedidos de acesso a trabalhos privados
router.post('/works/:id/access-requests', authenticateToken, writeLimiter, requestWorkAccess);
router.get('/works/:id/access-requests', authenticateToken, getWorkAccessRequests);
router.patch(
  '/works/:id/access-requests/:requestId',
  authenticateToken,
  validateBody(respondWorkAccessRequestSchema),
  respondToWorkAccessRequest,
);

export default router;
