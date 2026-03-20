import { Router } from 'express';
import { createProject, getAllProjects, getProjectById, updateProject, deleteProject } from '../controllers/project.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateBody } from '../lib/validate';
import { createProjectSchema } from '../lib/schemas';

const router = Router();

// Rotas públicas
router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);

// Rotas protegidas
router.post('/projects', authenticateToken, validateBody(createProjectSchema), createProject);
router.put('/projects/:id', authenticateToken, updateProject);
router.delete('/projects/:id', authenticateToken, deleteProject);

export default router;
