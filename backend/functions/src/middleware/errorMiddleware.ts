import { NextFunction, Request, Response } from 'express';
import { ERROR_CODES, isAppError } from '../shared/errors';
import { sendError } from '../shared/responses/apiResponse';
import { logger } from '../shared/logger/logger';
import { sanitizeForLog } from '../shared/utils/requestId';
import { isProduction } from '../config/env';

export function notFoundHandler(req: Request, res: Response): Response {
  return sendError(res, 404, ERROR_CODES.NOT_FOUND, `Route not found: ${req.method} ${req.path}`);
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  const startTime = res.locals.startTime as number | undefined;
  const durationMs = startTime ? Date.now() - startTime : undefined;

  if (isAppError(err)) {
    logger.warn('Request failed with operational error', {
      requestId: req.requestId,
      userId: req.user?.uid,
      endpoint: req.originalUrl,
      status: err.statusCode,
      durationMs,
      errorCode: err.code,
      message: err.message,
    });

    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  if (err instanceof Error && err.name === 'UnauthorizedError') {
    return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Unauthorized');
  }

  logger.error('Unhandled error', {
    requestId: req.requestId,
    userId: req.user?.uid,
    endpoint: req.originalUrl,
    durationMs,
    errorCode: ERROR_CODES.INTERNAL_ERROR,
    message: err instanceof Error ? err.message : 'Unknown error',
    ...(isProduction() ? {} : { stack: err instanceof Error ? sanitizeForLog(err.stack) : undefined }),
  });

  return sendError(
    res,
    500,
    ERROR_CODES.INTERNAL_ERROR,
    isProduction() ? 'Internal server error' : err instanceof Error ? err.message : 'Internal server error',
  );
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
