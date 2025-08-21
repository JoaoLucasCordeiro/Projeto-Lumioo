// src/routes/user.routes.ts
import { Router } from 'express';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser, getMyProfile } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Agrupa as rotas do perfil do usuário logado
router.get('/profile', authenticateToken, getMyProfile);
router.put('/profile', authenticateToken, updateUser); // <-- ROTA CORRIGIDA AQUI

// Rotas públicas ou para admin
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', authenticateToken, deleteUser); // Mantém para admin no futuro

export default router;