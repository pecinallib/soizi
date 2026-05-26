export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'Não autorizado'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Acesso negado'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Recurso não encontrado'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static tooMany(message = 'Muitas requisições, tente novamente mais tarde'): ApiError {
    return new ApiError(429, message);
  }

  static internal(message = 'Erro interno do servidor'): ApiError {
    return new ApiError(500, message, false);
  }
}
