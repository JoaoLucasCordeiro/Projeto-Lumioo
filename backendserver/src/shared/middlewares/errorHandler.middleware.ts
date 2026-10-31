import { NextFunction, Request, Response } from 'express';
import { AppError, isPrismaError } from '../errors';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, ...err.extra });
  }

  // Erros conhecidos do Prisma que escaparam dos services
  if (isPrismaError(err, 'P2025')) return res.status(404).json({ error: 'Resource not found.' });
  if (isPrismaError(err, 'P2003')) return res.status(404).json({ error: 'Resource not found.' });
  if (isPrismaError(err, 'P2002')) return res.status(409).json({ error: 'Unique constraint violation.' });
  if (isPrismaError(err, 'P1001')) return res.status(503).json({ error: 'Database unavailable.' });

  console.error('[Error]', err);
  const status = (err as { status?: number })?.status ?? 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error.' : (err as Error).message });
};
