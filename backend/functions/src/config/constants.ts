export const USER_ROLES = {
  PET_OWNER: 'PET_OWNER',
  VET: 'VET',
  CLINIC_ADMIN: 'CLINIC_ADMIN',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const DEFAULT_USER_ROLE: UserRole = USER_ROLES.PET_OWNER;

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'ml'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export const API_PREFIX = '/api/v1';

export const COLLECTIONS = {
  USERS: 'users',
  PETS: 'pets',
  REMINDERS: 'reminders',
  APPOINTMENTS: 'appointments',
  VET_CLINICS: 'vetClinics',
  VET_PROFILES: 'vetProfiles',
  CONSULTATIONS: 'consultations',
  POSTS: 'posts',
  REELS: 'reels',
  INSURANCE_PLANS: 'insurancePlans',
  WALKERS: 'walkers',
  WALKS: 'walks',
  LOST_PET_TAGS: 'lostPetTags',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  AUDIT_LOGS: 'auditLogs',
} as const;

export const FILE_LIMITS = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ] as const,
} as const;

export const RATE_LIMIT_WINDOWS = {
  ONE_MINUTE_MS: 60_000,
} as const;

export const AI_URGENCY_LEVELS = ['LOW', 'MODERATE', 'URGENT', 'EMERGENCY'] as const;

export const HEALTH_DISCLAIMER =
  'AnimalSetu AI provides general educational information and does not replace professional veterinary diagnosis or treatment. If your pet has severe, rapidly worsening, or emergency symptoms, contact a veterinarian immediately.';
