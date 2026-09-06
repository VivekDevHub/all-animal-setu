import { ErrorCode, HTTP_STATUS } from './errorCodes';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      details?: unknown;
      isOperational?: boolean;
      statusCode?: number;
    },
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = options?.statusCode ?? HTTP_STATUS[code];
    this.details = options?.details;
    this.isOperational = options?.isOperational ?? true;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
