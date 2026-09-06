import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import {
  createRateLimiter,
  dietPlanLimiter,
  healthAssistantLimiter,
  resetRateLimitStoreForTests,
} from './rateLimitMiddleware';
import { ERROR_CODES } from '../shared/errors';

function createMockReq(uid = 'test-user'): Request {
  return {
    user: { uid },
    ip: '127.0.0.1',
    headers: {},
  } as unknown as Request;
}

const mockRes = {} as Response;

describe('Phase 3 Rate Limiters', () => {
  beforeEach(() => {
    resetRateLimitStoreForTests();
  });

  it('allows requests within limit and blocks on exceeding limit', () => {
    const limiter = createRateLimiter({
      keyPrefix: 'test_phase3',
      maxRequests: 3,
      windowMs: 60000,
      getKey: (req) => req.user?.uid ?? 'anon',
    });

    const req = createMockReq('user-1');
    const next = vi.fn();

    // 3 requests allowed
    limiter(req, mockRes, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenLastCalledWith();

    limiter(req, mockRes, next);
    expect(next).toHaveBeenCalledTimes(2);

    limiter(req, mockRes, next);
    expect(next).toHaveBeenCalledTimes(3);

    // 4th request blocked with rate limit error
    limiter(req, mockRes, next);
    expect(next).toHaveBeenCalledTimes(4);
    const errorArg = next.mock.calls[3][0];
    expect(errorArg).toBeDefined();
    expect(errorArg.code).toBe(ERROR_CODES.RATE_LIMITED);
  });

  it('isolates limits across different users', () => {
    const limiter = createRateLimiter({
      keyPrefix: 'user_isolation',
      maxRequests: 1,
      windowMs: 60000,
      getKey: (req) => req.user?.uid ?? 'anon',
    });

    const reqUserA = createMockReq('user-A');
    const reqUserB = createMockReq('user-B');
    const nextA = vi.fn();
    const nextB = vi.fn();

    limiter(reqUserA, mockRes, nextA);
    expect(nextA).toHaveBeenCalledWith();

    // User A blocked on second call
    limiter(reqUserA, mockRes, nextA);
    expect(nextA.mock.calls[1][0].code).toBe(ERROR_CODES.RATE_LIMITED);

    // User B still succeeds on first call
    limiter(reqUserB, mockRes, nextB);
    expect(nextB).toHaveBeenCalledWith();
  });
});
