import { NextFunction, Request, Response } from 'express';
import { getEnv } from '../config/env';
import { RATE_LIMIT_WINDOWS } from '../config/constants';
import { AppError, ERROR_CODES } from '../shared/errors';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  limitType?: 'ai' | 'auth' | 'upload';
  keyPrefix?: string;
  getKey?: (req: Request) => string;
}

function resolveMaxRequests(options: RateLimitOptions): number {
  if (options.maxRequests !== undefined) {
    return options.maxRequests;
  }

  const env = getEnv();
  switch (options.limitType) {
    case 'auth':
      return env.RATE_LIMIT_AUTH_PER_MINUTE;
    case 'upload':
      return env.RATE_LIMIT_UPLOAD_PER_MINUTE;
    case 'ai':
    default:
      return env.RATE_LIMIT_AI_PER_MINUTE;
  }
}

function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? RATE_LIMIT_WINDOWS.ONE_MINUTE_MS;
  const keyPrefix = options.keyPrefix ?? 'global';

  return (req: Request, _res: Response, next: NextFunction): void => {
    const maxRequests = resolveMaxRequests(options);
    const now = Date.now();
    cleanupExpiredEntries(now);

    const identity = options.getKey?.(req) ?? req.user?.uid ?? req.ip ?? 'anonymous';
    const key = `${keyPrefix}:${identity}`;

    const existing = store.get(key);

    if (!existing || existing.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (existing.count >= maxRequests) {
      next(
        new AppError(ERROR_CODES.RATE_LIMITED, 'Too many requests. Please try again later.', {
          details: {
            retryAfterMs: existing.resetAt - now,
          },
        }),
      );
      return;
    }

    existing.count += 1;
    store.set(key, existing);
    next();
  };
}

export function resetRateLimitStoreForTests(): void {
  store.clear();
}

export const aiRateLimiter = createRateLimiter({
  keyPrefix: 'ai',
  limitType: 'ai',
  getKey: (req) => req.user?.uid ?? req.ip ?? 'anonymous',
});

export const authRateLimiter = createRateLimiter({
  keyPrefix: 'auth',
  limitType: 'auth',
});

export const uploadRateLimiter = createRateLimiter({
  keyPrefix: 'upload',
  limitType: 'upload',
});
