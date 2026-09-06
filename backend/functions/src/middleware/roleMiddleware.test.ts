import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requireRole, requireAdmin } from '../middleware/roleMiddleware';
import { UserRole } from '../config/constants';
import { AppError, ERROR_CODES } from '../shared/errors';
import { AuthenticatedUser } from '../shared/types/user.types';

function createMockUser(role: UserRole): AuthenticatedUser {
  return {
    uid: 'user-1',
    email: 'test@example.com',
    profile: {
      uid: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      phone: '',
      profileImage: '',
      role,
      isActive: true,
      isVerified: false,
      language: 'en',
      timezone: 'Asia/Kolkata',
      createdAt: {} as FirebaseFirestore.Timestamp,
      updatedAt: {} as FirebaseFirestore.Timestamp,
    },
  };
}

describe('roleMiddleware', () => {
  it('rejects unauthenticated requests', () => {
    const req = {} as Request;
    const next = vi.fn() as NextFunction;

    requireAdmin(req, {} as Response, next);

    const error = next.mock.calls[0][0] as AppError;
    expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
  });

  it('rejects PET_OWNER on admin route', () => {
    const req = { user: createMockUser('PET_OWNER') } as Request;
    const next = vi.fn() as NextFunction;

    requireAdmin(req, {} as Response, next);

    const error = next.mock.calls[0][0] as AppError;
    expect(error.code).toBe(ERROR_CODES.INVALID_ROLE);
  });

  it('allows ADMIN on admin route', () => {
    const req = { user: createMockUser('ADMIN') } as Request;
    const next = vi.fn() as NextFunction;

    requireAdmin(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('allows configured roles', () => {
    const req = { user: createMockUser('VET') } as Request;
    const next = vi.fn() as NextFunction;

    requireRole('VET', 'ADMIN')(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });
});
