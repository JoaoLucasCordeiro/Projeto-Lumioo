import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';

interface LimiterOptions {
  windowMs: number;
  max: number;
  message: string;
}

/** Limitador por IP, em memória. Desligado em NODE_ENV=test para os testes não esbarrarem nele. */
export const createLimiter = ({ windowMs, max, message }: LimiterOptions) =>
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
  });

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Login: freia força bruta de senha.
export const loginLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 10,
  message: 'Too many login attempts. Try again in 15 minutes.',
});

// Cadastro de conta e troca de senha: ações raras para um usuário legítimo, alvo natural de
// automação (criação em massa de contas, brute-force da senha atual via /profile/password).
export const accountActionLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 5,
  message: 'Too many attempts. Try again in 15 minutes.',
});

// Criação de conteúdo (posts, comentários, trabalhos, projetos, conversas, pedidos de acesso):
// limita flood/spam automatizado sem incomodar o uso normal.
export const writeLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 30,
  message: 'Too many requests. Try again in 15 minutes.',
});

// Ações sociais de alta frequência (seguir, curtir, bloquear): mais permissivo, mas ainda
// impede bots de seguir/curtir em massa.
export const socialActionLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 60,
  message: 'Too many requests. Try again in 15 minutes.',
});
