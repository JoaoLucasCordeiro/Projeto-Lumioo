import { Router } from 'express';
import { toggleCommentLike, togglePostLike } from '../controllers/like.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { socialActionLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/posts/:postId/like', authenticateToken, socialActionLimiter, togglePostLike);
router.post('/comments/:commentId/like', authenticateToken, socialActionLimiter, toggleCommentLike);

export default router;