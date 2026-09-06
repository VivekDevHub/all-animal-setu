import { NextFunction, Request, Response } from 'express';
import { getAuth, getFirestore } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { AppError, ERROR_CODES } from '../shared/errors';
import { AuthenticatedUser, UserProfile } from '../shared/types/user.types';
import { logger } from '../shared/logger/logger';

function mapUserProfile(data: FirebaseFirestore.DocumentData, uid: string): UserProfile {
  return {
    uid,
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    profileImage: data.profileImage ?? '',
    role: data.role,
    isActive: data.isActive ?? true,
    isVerified: data.isVerified ?? false,
    language: data.language ?? 'en',
    timezone: data.timezone ?? 'Asia/Kolkata',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function authenticateUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 'Missing or invalid Authorization header');
    }

    const token = authHeader.slice('Bearer '.length).trim();

    if (!token) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 'Missing Firebase ID token');
    }

    const decoded = await getAuth().verifyIdToken(token);

    let profile: UserProfile | null = null;
    const userDoc = await getFirestore().collection(COLLECTIONS.USERS).doc(decoded.uid).get();

    if (userDoc.exists) {
      profile = mapUserProfile(userDoc.data()!, decoded.uid);

      if (profile.isActive === false) {
        throw new AppError(ERROR_CODES.FORBIDDEN, 'Account is deactivated');
      }
    }

    const authenticatedUser: AuthenticatedUser = {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified,
      profile,
    };

    req.user = authenticatedUser;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    logger.warn('Authentication failed', {
      requestId: req.requestId,
      endpoint: req.originalUrl,
      errorCode: ERROR_CODES.UNAUTHORIZED,
    });

    next(new AppError(ERROR_CODES.UNAUTHORIZED, 'Invalid or expired Firebase ID token'));
  }
}

export function optionalAuthenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  void authenticateUser(req, res, next);
}
