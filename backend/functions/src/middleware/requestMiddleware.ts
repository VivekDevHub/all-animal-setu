import { NextFunction, Request, Response } from 'express';
import { generateRequestId } from '../shared/utils/requestId';
import { logger } from '../shared/logger/logger';

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.requestId = (req.headers['x-request-id'] as string | undefined) ?? generateRequestId();
  res.setHeader('X-Request-Id', req.requestId);
  res.locals.startTime = Date.now();
  next();
}

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.on('finish', () => {
    const durationMs = Date.now() - (res.locals.startTime as number);
    logger.info('Request completed', {
      requestId: req.requestId,
      userId: req.user?.uid,
      endpoint: req.originalUrl,
      status: res.statusCode,
      durationMs,
    });
  });
  next();
}
