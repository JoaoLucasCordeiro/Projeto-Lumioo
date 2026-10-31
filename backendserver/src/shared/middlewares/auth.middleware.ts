import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

const readToken = (req: Request): string | undefined => req.headers['authorization']?.split(' ')[1];

/** Exige `Authorization: Bearer <jwt>`; popula `req.user`. */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = readToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

/** Igual ao anterior, mas deixa passar anônimos (token inválido é ignorado). */
export const optionalAuthenticateToken = (req: Request, _res: Response, next: NextFunction) => {
  const token = readToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    } catch {
      console.warn('Invalid token in optional auth, proceeding as unauthenticated.');
    }
  }
  next();
};
