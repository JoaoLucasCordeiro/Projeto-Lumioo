import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { createComment, deleteComment, getCommentsForPost } from '../controllers/comments.controller';

const router = Router();

router.post('/posts/:postId/comments', authenticateToken, createComment);
router.get('/posts/:postId/comments', getCommentsForPost);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

export default router;