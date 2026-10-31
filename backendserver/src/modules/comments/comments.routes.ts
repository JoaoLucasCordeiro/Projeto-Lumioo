import { Router } from 'express';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';
import { socialActionLimiter, writeLimiter } from '../../shared/middlewares/rateLimit.middleware';
import { validateBody } from '../../shared/middlewares/validate.middleware';
import {
  createComment, deleteComment, getCommentsForPost, toggleCommentLike, updateComment,
} from './comments.controller';
import { commentSchema } from './comments.schemas';

const router = Router();

router.post('/posts/:postId/comments', authenticateToken, writeLimiter, validateBody(commentSchema), createComment);
router.get('/posts/:postId/comments', getCommentsForPost);
router.put('/comments/:commentId', authenticateToken, validateBody(commentSchema), updateComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);
router.post('/comments/:commentId/like', authenticateToken, socialActionLimiter, toggleCommentLike);

export default router;
