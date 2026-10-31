import { Router } from 'express';
import { loginLimiter } from '../../shared/middlewares/rateLimit.middleware';
import { validateBody } from '../../shared/middlewares/validate.middleware';
import { signIn } from './auth.controller';
import { signInSchema } from './auth.schemas';

const router = Router();

router.post('/signin', loginLimiter, validateBody(signInSchema), signIn);

export default router;
