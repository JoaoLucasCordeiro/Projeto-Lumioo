import { NextFunction, Request, RequestHandler, Response } from 'express';
import { forbidden } from './errors';

/** Encaminha erros de handlers async para o errorHandler (Express 4 não faz isso sozinho). */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

/** Id do usuário autenticado (as rotas protegidas já passaram por authenticateToken). */
export const requireUserId = (req: Request): string => {
  const id = req.user?.userId;
  if (!id) throw forbidden('User not authenticated.');
  return id;
};

/** Valor de query string como texto simples (ignora arrays e objetos). */
export const queryString = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value : undefined;
