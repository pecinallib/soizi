import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/api-error';
import { apiError } from '../utils/api-response';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    apiError(res, err.statusCode, err.message);
    return;
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    apiError(res, 400, 'Dados inválidos', formattedErrors);
    return;
  }

  console.error('❌ Erro não tratado:', err);

  const message = env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor';

  apiError(res, 500, message);
}
