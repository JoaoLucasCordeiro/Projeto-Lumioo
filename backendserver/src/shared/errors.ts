/**
 * Erro de aplicação com status HTTP. Services lançam estes erros e o errorHandler
 * os traduz para `{ error: message, ...extra }`.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly extra?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (message: string) => new AppError(400, message);
export const unauthorized = (message: string) => new AppError(401, message);
export const forbidden = (message: string, extra?: Record<string, unknown>) => new AppError(403, message, extra);
export const notFound = (message: string) => new AppError(404, message);
export const conflict = (message: string) => new AppError(409, message);

/** Erro conhecido do Prisma com o código informado (P2002 = único, P2025 = não encontrado…). */
export const isPrismaError = (err: unknown, code: string): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === code;
