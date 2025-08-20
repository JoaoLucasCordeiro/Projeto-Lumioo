import { Router } from 'express';
import { createPost, getAllPosts, getPostById, updatePost, deletePost, getFeedPosts } from '../controllers/post.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { optionalAuthenticateToken } from '../middlewares/optionalAuth.middleware';

const router = Router();

// Rotas públicas
router.get('/posts', optionalAuthenticateToken, getAllPosts);
router.get('/posts/:id', getPostById);

// Rotas protegidas
router.post('/posts', authenticateToken, createPost);
router.put('/posts/:id', authenticateToken, updatePost);
router.delete('/posts/:id', authenticateToken, deletePost);
router.get('/feed', authenticateToken, getFeedPosts);
router.get('/posts/:id', optionalAuthenticateToken, getPostById);

export default router;
