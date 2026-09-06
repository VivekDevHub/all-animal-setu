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
  limitType?: 'ai' | 'auth' | 'upload' | 'ai_health' | 'ai_diet' | 'ai_exercise' | 'ai_breed' | 'places';
  keyPrefix?: string;
  getKey?: (req: Request) => string;
  errorCode?: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
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
    case 'ai_health':
      return env.RATE_LIMIT_AI_HEALTH_HOURLY;
    case 'ai_diet':
      return env.RATE_LIMIT_AI_DIET_HOURLY;
    case 'ai_exercise':
      return env.RATE_LIMIT_AI_EXERCISE_HOURLY;
    case 'ai_breed':
      return env.RATE_LIMIT_AI_BREED_HOURLY;
    case 'places':
      return env.RATE_LIMIT_PLACES_HOURLY;
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
  const errorCode = options.errorCode ?? ERROR_CODES.RATE_LIMITED;

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
        new AppError(errorCode, 'Rate limit exceeded. Please try again later.', {
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

export const healthAssistantLimiter = createRateLimiter({
  keyPrefix: 'ai_health',
  limitType: 'ai_health',
  windowMs: RATE_LIMIT_WINDOWS.ONE_HOUR_MS,
  getKey: (req) => req.user?.uid ?? req.ip ?? 'anonymous',
});

export const dietPlanLimiter = createRateLimiter({
  keyPrefix: 'ai_diet',
  limitType: 'ai_diet',
  windowMs: RATE_LIMIT_WINDOWS.ONE_HOUR_MS,
  getKey: (req) => req.user?.uid ?? req.ip ?? 'anonymous',
});

export const exercisePlanLimiter = createRateLimiter({
  keyPrefix: 'ai_exercise',
  limitType: 'ai_exercise',
  windowMs: RATE_LIMIT_WINDOWS.ONE_HOUR_MS,
  getKey: (req) => req.user?.uid ?? req.ip ?? 'anonymous',
});

export const breedIdentLimiter = createRateLimiter({
  keyPrefix: 'ai_breed',
  limitType: 'ai_breed',
  windowMs: RATE_LIMIT_WINDOWS.ONE_HOUR_MS,
  getKey: (req) => req.user?.uid ?? req.ip ?? 'anonymous',
});

export const placesLimiter = createRateLimiter({
  keyPrefix: 'places',
  limitType: 'places',
  windowMs: RATE_LIMIT_WINDOWS.ONE_HOUR_MS,
  getKey: (req) => req.user?.uid ?? req.ip ?? 'anonymous',
});
