import { Router } from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  getProjectFieldSuggestions,
} from '../controllers/project.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { writeLimiter } from '../middlewares/rateLimit.middleware';
import { validateBody } from '../lib/validate';
import { createProjectSchema, updateProjectSchema } from '../lib/schemas';

const router = Router();

// Rotas públicas
router.get('/projects', getAllProjects);

// --- ESTATÍSTICAS/AGREGAÇÃO E SUGESTÕES (precisam vir antes de /projects/:id) ---
router.get('/projects/stats', getProjectStats);
router.get('/projects/suggestions', getProjectFieldSuggestions);

router.get('/projects/:id', getProjectById);

// Rotas protegidas
router.post('/projects', authenticateToken, writeLimiter, validateBody(createProjectSchema), createProject);
router.put('/projects/:id', authenticateToken, validateBody(updateProjectSchema), updateProject);
router.delete('/projects/:id', authenticateToken, deleteProject);

export default router;
