import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Prisma known errors
  if (err?.code === 'P2025') return res.status(404).json({ error: 'Resource not found.' });
  if (err?.code === 'P2002') return res.status(409).json({ error: 'Unique constraint violation.' });
  if (err?.code === 'P1001') return res.status(503).json({ error: 'Database unavailable.' });

  console.error('[Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
};
