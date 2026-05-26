import type { Response } from 'express';

interface Explanation {
  title: string;
  description: string;
  example?: string;
}

interface SuccessResponse<T> {
  success: true;
  message: string;
  data?: T;
  explanation?: Explanation;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

export function apiResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  explanation?: Explanation,
): void {
  const body: SuccessResponse<T> = { success: true, message };

  if (data !== undefined) body.data = data;
  if (explanation) body.explanation = explanation;

  res.status(statusCode).json(body);
}

export function apiError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown,
): void {
  const body: ErrorResponse = { success: false, message };

  if (errors) body.errors = errors;

  res.status(statusCode).json(body);
}
