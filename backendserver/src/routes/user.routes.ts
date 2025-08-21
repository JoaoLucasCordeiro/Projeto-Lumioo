// src/routes/user.routes.ts
import { Router } from 'express';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser, getMyProfile, changePassword } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Agrupa as rotas do perfil do usuário logado
router.get('/profile', authenticateToken, getMyProfile);
router.put('/profile', authenticateToken, updateUser);

// Rotas públicas ou para admin
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', authenticateToken, deleteUser);
router.put('/profile/password', authenticateToken, changePassword);


export default router;