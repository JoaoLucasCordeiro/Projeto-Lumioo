import rateLimit from 'express-rate-limit';

// Cadastro de conta e troca de senha: ações raras para um usuário legítimo, alvo natural de
// automação (criação em massa de contas, brute-force da senha atual via /profile/password).
export const accountActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Criação de conteúdo (posts, comentários, trabalhos, projetos, conversas, pedidos de acesso):
// limita flood/spam automatizado sem incomodar o uso normal.
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ações sociais de alta frequência (seguir, curtir, bloquear): mais permissivo, mas ainda
// impede bots de seguir/curtir em massa.
export const socialActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: 'Too many requests. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
