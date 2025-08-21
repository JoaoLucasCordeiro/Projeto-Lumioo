import { Router } from 'express';
import { createWork, getAllWorks, getWorkById, updateWork, deleteWork, downloadWorkById } from '../controllers/work.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Rotas públicas
router.post('/works', authenticateToken, createWork);
router.get('/works', getAllWorks);
router.get('/works/:id', getWorkById);
router.put('/works/:id', authenticateToken, updateWork);
router.delete('/works/:id', authenticateToken, deleteWork);

// --- NOVA ROTA DE DOWNLOAD ---
router.get('/works/:id/download', downloadWorkById);

export default router;