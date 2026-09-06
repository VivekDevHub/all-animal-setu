import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError, ERROR_CODES } from '../shared/errors';

type RequestPart = 'body' | 'query' | 'params';

export function validateRequest(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[part]);
      req[part] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(ERROR_CODES.VALIDATION_ERROR, 'Validation failed', {
            details: error.flatten(),
          }),
        );
        return;
      }
      next(error);
    }
  };
}

export function validateBody<T extends ZodSchema>(schema: T) {
  return validateRequest(schema, 'body');
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return validateRequest(schema, 'query');
}

export function validateParams<T extends ZodSchema>(schema: T) {
  return validateRequest(schema, 'params');
}
