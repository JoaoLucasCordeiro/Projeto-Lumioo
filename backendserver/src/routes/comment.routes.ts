import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { createComment, deleteComment, getCommentsForPost, updateComment } from '../controllers/comments.controller';
import { writeLimiter } from '../middlewares/rateLimit.middleware';
import { validateBody } from '../lib/validate';
import { createCommentSchema } from '../lib/schemas';

const router = Router();

router.post('/posts/:postId/comments', authenticateToken, writeLimiter, validateBody(createCommentSchema), createComment);
router.get('/posts/:postId/comments', getCommentsForPost);
router.put('/comments/:commentId', authenticateToken, updateComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

export default router;