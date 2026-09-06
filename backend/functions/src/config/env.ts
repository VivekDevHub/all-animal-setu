import { z } from 'zod';

const envSchema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('AnimalSetu'),
  API_VERSION: z.string().default('v1'),

  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_CLOUD_PROJECT: z.string().optional(),

  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),

  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173')
    .transform((val) =>
      val
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  RATE_LIMIT_AI_PER_MINUTE: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_AUTH_PER_MINUTE: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_UPLOAD_PER_MINUTE: z.coerce.number().int().positive().default(10),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function loadEnvFromProcess(): Record<string, string | undefined> {
  return {
    APP_ENV: process.env.APP_ENV,
    APP_NAME: process.env.APP_NAME,
    API_VERSION: process.env.API_VERSION,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
    RATE_LIMIT_AI_PER_MINUTE: process.env.RATE_LIMIT_AI_PER_MINUTE,
    RATE_LIMIT_AUTH_PER_MINUTE: process.env.RATE_LIMIT_AUTH_PER_MINUTE,
    RATE_LIMIT_UPLOAD_PER_MINUTE: process.env.RATE_LIMIT_UPLOAD_PER_MINUTE,
    LOG_LEVEL: process.env.LOG_LEVEL,
  };
}

export function getEnv(overrides?: Partial<Record<keyof Env, string>>): Env {
  if (cachedEnv && !overrides) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse({
    ...loadEnvFromProcess(),
    ...overrides,
  });

  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment configuration: ${JSON.stringify(details)}`);
  }

  if (!overrides) {
    cachedEnv = parsed.data;
  }

  return parsed.data;
}

export function resetEnvCache(): void {
  cachedEnv = null;
}

export function isProduction(): boolean {
  return getEnv().APP_ENV === 'production';
}

export function isDevelopment(): boolean {
  return getEnv().APP_ENV === 'development';
}

export function isTest(): boolean {
  return getEnv().APP_ENV === 'test';
}
