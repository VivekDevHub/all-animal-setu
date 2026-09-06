import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../config/constants';
import { AppError, ERROR_CODES } from '../shared/errors';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      next(new AppError(ERROR_CODES.UNAUTHORIZED, 'Authentication required'));
      return;
    }

    const role = user.profile?.role;

    if (!role) {
      next(new AppError(ERROR_CODES.FORBIDDEN, 'User profile not found'));
      return;
    }

    if (!allowedRoles.includes(role)) {
      next(
        new AppError(
          ERROR_CODES.INVALID_ROLE,
          `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        ),
      );
      return;
    }

    next();
  };
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  requireRole('ADMIN')(req, _res, next);
}

export function requireVet(req: Request, _res: Response, next: NextFunction): void {
  requireRole('VET', 'ADMIN')(req, _res, next);
}

export function requirePetOwner(req: Request, _res: Response, next: NextFunction): void {
  requireRole('PET_OWNER', 'VET', 'ADMIN')(req, _res, next);
}
