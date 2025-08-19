import { Router } from 'express';
import { signIn } from '../controllers/auth.controller';

const router = Router();

router.post('/signin', signIn);

export default router;
