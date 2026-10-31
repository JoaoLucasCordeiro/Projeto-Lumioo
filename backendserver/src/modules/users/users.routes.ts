import { Router } from 'express';
import { authenticateToken, optionalAuthenticateToken } from '../../shared/middlewares/auth.middleware';
import { accountActionLimiter } from '../../shared/middlewares/rateLimit.middleware';
import { validateBody } from '../../shared/middlewares/validate.middleware';
import {
  changePassword, createUser, deleteUser, getAllUsers, getMyProfile,
  getUserById, getUserProfileByUsername, updateUser,
} from './users.controller';
import { changePasswordSchema, createUserSchema, updateProfileSchema } from './users.schemas';

const router = Router();

// Perfil do usuário logado e perfis públicos
router.get('/profile', authenticateToken, getMyProfile);
router.put('/profile', authenticateToken, validateBody(updateProfileSchema), updateUser);
router.post('/profile/password', authenticateToken, accountActionLimiter, validateBody(changePasswordSchema), changePassword);
router.get('/profile/:username', optionalAuthenticateToken, getUserProfileByUsername);

// Usuários
router.post('/users', accountActionLimiter, validateBody(createUserSchema), createUser);
router.get('/users', authenticateToken, getAllUsers);
router.get('/users/:id', authenticateToken, getUserById);
router.delete('/users/:id', authenticateToken, deleteUser);

export default router;
