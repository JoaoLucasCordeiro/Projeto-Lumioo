import { Router } from 'express';
import { createWork, getAllWorks, getWorkById, updateWork, deleteWork } from '../controllers/work.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Rotas públicas
router.get('/works', getAllWorks);
router.get('/works/:id', getWorkById);

// Rotas protegidas
router.post('/works', authenticateToken, createWork);
router.put('/works/:id', authenticateToken, updateWork);
router.delete('/works/:id', authenticateToken, deleteWork);

export default router;