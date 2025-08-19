import { Router } from 'express';
import { toggleCommentLike, togglePostLike } from '../controllers/like.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/posts/:postId/like', authenticateToken, togglePostLike);
router.post('/comments/:commentId/like', authenticateToken, toggleCommentLike);

export default router;