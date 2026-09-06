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
  DOCUMENTS: 'documents',
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

export const PET_PHOTO_LIMITS = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
} as const;

export const PET_SPECIES = [
  'Dog',
  'Cat',
  'Bird',
  'Rabbit',
  'Fish',
  'Reptile',
  'Hamster',
  'Other',
] as const;

export type PetSpecies = (typeof PET_SPECIES)[number];

export const PET_GENDERS = ['Male', 'Female', 'Unknown'] as const;

export type PetGender = (typeof PET_GENDERS)[number];

export const WEIGHT_UNITS = ['kg', 'lb'] as const;

export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const RATE_LIMIT_WINDOWS = {
  ONE_MINUTE_MS: 60_000,
} as const;

export const AI_URGENCY_LEVELS = ['LOW', 'MODERATE', 'URGENT', 'EMERGENCY'] as const;

export const HEALTH_DISCLAIMER =
  'AnimalSetu AI provides general educational information and does not replace professional veterinary diagnosis or treatment. If your pet has severe, rapidly worsening, or emergency symptoms, contact a veterinarian immediately.';

export const MEDICAL_RECORD_TYPES = [
  'CHECKUP',
  'SURGERY',
  'LAB_REPORT',
  'PRESCRIPTION',
  'VACCINATION',
  'EMERGENCY',
  'OTHER',
] as const;

export type MedicalRecordType = (typeof MEDICAL_RECORD_TYPES)[number];

export const REMINDER_TYPES = [
  'VACCINATION',
  'MEDICATION',
  'APPOINTMENT',
  'HEALTH_CHECK',
  'CUSTOM',
] as const;

export type ReminderType = (typeof REMINDER_TYPES)[number];

export const REMINDER_STATUSES = ['PENDING', 'SENT', 'COMPLETED', 'CANCELLED'] as const;

export type ReminderStatus = (typeof REMINDER_STATUSES)[number];

export const MEDICATION_FREQUENCIES = [
  'ONCE',
  'DAILY',
  'TWICE_DAILY',
  'WEEKLY',
  'CUSTOM',
] as const;

export type MedicationFrequency = (typeof MEDICATION_FREQUENCIES)[number];

export const OCR_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CONFIRMED',
] as const;

export type OcrStatus = (typeof OCR_STATUSES)[number];

export const HEALTH_PASSPORT_DOC_ID = 'main';

export const SUBCOLLECTIONS = {
  HEALTH_PASSPORT: 'healthPassport',
  MEDICAL_RECORDS: 'medicalRecords',
  VACCINATIONS: 'vaccinations',
  MEDICATIONS: 'medications',
} as const;

export const DEFAULT_VACCINATION_REMINDER_DAYS_BEFORE = 7;
