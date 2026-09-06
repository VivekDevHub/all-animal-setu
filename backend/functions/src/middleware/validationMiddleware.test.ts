import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validationMiddleware';
import { AppError, ERROR_CODES } from '../shared/errors';

describe('validateBody middleware', () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
  });

  it('parses valid request body', () => {
    const req = { body: { name: 'Bruno', age: 3 } } as Request;
    const next = vi.fn() as NextFunction;

    validateBody(schema)(req, {} as Response, next);

    expect(req.body).toEqual({ name: 'Bruno', age: 3 });
    expect(next).toHaveBeenCalledWith();
  });

  it('returns validation error for invalid body', () => {
    const req = { body: { name: '', age: -1 } } as Request;
    const next = vi.fn() as NextFunction;

    validateBody(schema)(req, {} as Response, next);

    expect(next).toHaveBeenCalledOnce();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});
