import { Router } from 'express';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';
import { socialActionLimiter } from '../../shared/middlewares/rateLimit.middleware';
import {
  blockUser, followUser, getBlockedUsers, getFollowers, getFollowing, unblockUser, unfollowUser,
} from './follows.controller';

const router = Router();

// Seguir
router.post('/follow/:userId', authenticateToken, socialActionLimiter, followUser);
router.delete('/follow/:userId', authenticateToken, unfollowUser);

// Listas públicas
router.get('/users/:userId/followers', getFollowers);
router.get('/users/:userId/following', getFollowing);

// Bloquear
router.post('/block/:userId', authenticateToken, socialActionLimiter, blockUser);
router.delete('/block/:userId', authenticateToken, unblockUser);
router.get('/blocked', authenticateToken, getBlockedUsers);

export default router;
