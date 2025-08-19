import { Router } from 'express';
import { toggleSavePost } from '../controllers/savedPost.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/posts/:postId/save', authenticateToken, toggleSavePost);

export default router;
