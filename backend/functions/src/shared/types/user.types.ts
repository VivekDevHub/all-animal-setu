import { UserRole } from '../../config/constants';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  language: string;
  timezone: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  profile: UserProfile | null;
}

export interface PaginationParams {
  limit: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
