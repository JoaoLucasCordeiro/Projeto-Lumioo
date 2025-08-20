import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { createComment, deleteComment, getCommentsForPost, updateComment } from '../controllers/comments.controller';

const router = Router();

router.post('/posts/:postId/comments', authenticateToken, createComment);
router.get('/posts/:postId/comments', getCommentsForPost);
router.put('/comments/:commentId', authenticateToken, updateComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

export default router;