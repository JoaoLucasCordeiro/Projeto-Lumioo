import { Router } from 'express';
import { createPost, getAllPosts, getPostById, updatePost, deletePost } from '../controllers/post.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Rotas públicas
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostById);

// Rotas protegidas
router.post('/posts', authenticateToken, createPost);
router.put('/posts/:id', authenticateToken, updatePost);
router.delete('/posts/:id', authenticateToken, deletePost);

export default router;
