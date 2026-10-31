import { Router } from 'express';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';
import { writeLimiter } from '../../shared/middlewares/rateLimit.middleware';
import { validateBody } from '../../shared/middlewares/validate.middleware';
import {
  createProject, deleteProject, getAllProjects, getProjectById,
  getProjectFieldSuggestions, getProjectStats, updateProject,
} from './projects.controller';
import { createProjectSchema, updateProjectSchema } from './projects.schemas';

const router = Router();

router.get('/projects', getAllProjects);

// Estatísticas e sugestões precisam vir antes de /projects/:id
router.get('/projects/stats', getProjectStats);
router.get('/projects/suggestions', getProjectFieldSuggestions);

router.get('/projects/:id', getProjectById);

router.post('/projects', authenticateToken, writeLimiter, validateBody(createProjectSchema), createProject);
router.put('/projects/:id', authenticateToken, validateBody(updateProjectSchema), updateProject);
router.delete('/projects/:id', authenticateToken, deleteProject);

export default router;
