import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  createRateLimiter,
  resetRateLimitStoreForTests,
} from '../middleware/rateLimitMiddleware';
import { AppError, ERROR_CODES } from '../shared/errors';

describe('rateLimitMiddleware', () => {
  beforeEach(() => {
    resetRateLimitStoreForTests();
  });

  it('allows requests under the limit', () => {
    const limiter = createRateLimiter({
      maxRequests: 2,
      windowMs: 60_000,
      keyPrefix: 'test',
    });

    const req = { ip: '127.0.0.1' } as Request;
    const next = vi.fn() as NextFunction;

    limiter(req, {} as Response, next);
    limiter(req, {} as Response, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(next.mock.calls.every((call) => call.length === 0)).toBe(true);
  });

  it('blocks requests over the limit', () => {
    const limiter = createRateLimiter({
      maxRequests: 1,
      windowMs: 60_000,
      keyPrefix: 'test-block',
    });

    const req = { ip: '127.0.0.2' } as Request;
    const next = vi.fn() as NextFunction;

    limiter(req, {} as Response, next);
    limiter(req, {} as Response, next);

    const error = next.mock.calls[1][0] as AppError;
    expect(error.code).toBe(ERROR_CODES.RATE_LIMITED);
  });
});
