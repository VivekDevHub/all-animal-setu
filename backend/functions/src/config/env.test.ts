import { describe, it, expect, beforeEach } from 'vitest';
import { getEnv, resetEnvCache, isProduction, isTest } from '../config/env';

describe('env configuration', () => {
  beforeEach(() => {
    resetEnvCache();
  });

  it('loads required environment variables', () => {
    const env = getEnv({
      FIREBASE_PROJECT_ID: 'demo-animalsetu',
      APP_ENV: 'test',
    });

    expect(env.FIREBASE_PROJECT_ID).toBe('demo-animalsetu');
    expect(env.API_VERSION).toBe('v1');
    expect(env.CORS_ALLOWED_ORIGINS).toContain('http://localhost:3000');
  });

  it('throws when FIREBASE_PROJECT_ID is missing', () => {
    resetEnvCache();
    expect(() =>
      getEnv({
        FIREBASE_PROJECT_ID: '',
        APP_ENV: 'test',
      }),
    ).toThrow(/Invalid environment configuration/);
  });

  it('parses CORS origins from comma-separated string', () => {
    const env = getEnv({
      FIREBASE_PROJECT_ID: 'demo-animalsetu',
      CORS_ALLOWED_ORIGINS: 'http://a.com, http://b.com',
      APP_ENV: 'test',
    });

    expect(env.CORS_ALLOWED_ORIGINS).toEqual(['http://a.com', 'http://b.com']);
  });

  it('identifies test and production modes', () => {
    getEnv({ FIREBASE_PROJECT_ID: 'demo-animalsetu', APP_ENV: 'test' });
    expect(isTest()).toBe(true);
    expect(isProduction()).toBe(false);
  });
});
