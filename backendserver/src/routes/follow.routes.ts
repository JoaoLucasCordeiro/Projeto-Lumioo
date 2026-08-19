import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { socialActionLimiter } from '../middlewares/rateLimit.middleware';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from '../controllers/follow.controller';

const router = Router();

// Follow
router.post('/follow/:userId', authenticateToken, socialActionLimiter, followUser);
router.delete('/follow/:userId', authenticateToken, unfollowUser);

// Listas públicas
router.get('/users/:userId/followers', getFollowers);
router.get('/users/:userId/following', getFollowing);

// Block
router.post('/block/:userId', authenticateToken, socialActionLimiter, blockUser);
router.delete('/block/:userId', authenticateToken, unblockUser);
router.get('/blocked', authenticateToken, getBlockedUsers);

export default router;
