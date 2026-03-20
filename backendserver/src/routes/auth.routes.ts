import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signIn } from '../controllers/auth.controller';
import { validateBody } from '../lib/validate';
import { signInSchema } from '../lib/schemas';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signin', authLimiter, validateBody(signInSchema), signIn);

export default router;
