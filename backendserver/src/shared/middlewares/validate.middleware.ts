import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

/** Valida e normaliza `req.body` com Zod; responde 400 com a primeira mensagem de erro. */
export const validateBody =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }
    req.body = result.data;
    next();
  };
