import { Router } from 'express';
import { createWork, getAllWorks, getWorkById, updateWork, deleteWork, downloadWorkById } from '../controllers/work.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateBody } from '../lib/validate';
import { createWorkSchema } from '../lib/schemas';

const router = Router();

// Rotas públicas
router.post('/works', authenticateToken, validateBody(createWorkSchema), createWork);
router.get('/works', getAllWorks);
router.get('/works/:id', getWorkById);
router.put('/works/:id', authenticateToken, updateWork);
router.delete('/works/:id', authenticateToken, deleteWork);

// --- ROTA DE DOWNLOAD ---
router.get('/works/:id/download', authenticateToken, downloadWorkById);

export default router;