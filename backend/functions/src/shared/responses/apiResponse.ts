import { Response } from 'express';
import { ErrorCode } from '../errors/errorCodes';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  code: ErrorCode | string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  options?: { message?: string; statusCode?: number },
): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(options?.message ? { message: options.message } : {}),
  };
  return res.status(options?.statusCode ?? 200).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: ErrorCode | string,
  message: string,
  details?: unknown,
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return res.status(statusCode).json(body);
}
