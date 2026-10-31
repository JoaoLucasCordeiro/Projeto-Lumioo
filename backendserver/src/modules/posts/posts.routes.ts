import { Router } from 'express';
import { authenticateToken, optionalAuthenticateToken } from '../../shared/middlewares/auth.middleware';
import { socialActionLimiter, writeLimiter } from '../../shared/middlewares/rateLimit.middleware';
import { validateBody } from '../../shared/middlewares/validate.middleware';
import {
  createPost, deletePost, getAllPosts, getFeedPosts, getPostById,
  togglePostLike, toggleSavePost, updatePost,
} from './posts.controller';
import { createPostSchema, updatePostSchema } from './posts.schemas';

const router = Router();

router.get('/feed', authenticateToken, getFeedPosts);

router.get('/posts', optionalAuthenticateToken, getAllPosts);
router.post('/posts', authenticateToken, writeLimiter, validateBody(createPostSchema), createPost);
router.get('/posts/:id', optionalAuthenticateToken, getPostById);
router.put('/posts/:id', authenticateToken, validateBody(updatePostSchema), updatePost);
router.delete('/posts/:id', authenticateToken, deletePost);

router.post('/posts/:postId/like', authenticateToken, socialActionLimiter, togglePostLike);
router.post('/posts/:postId/save', authenticateToken, toggleSavePost);

export default router;
