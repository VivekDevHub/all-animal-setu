import { describe, it, expect } from 'vitest';
import { AppError, ERROR_CODES, HTTP_STATUS } from './index';

describe('AppError', () => {
  it('maps error codes to HTTP status codes', () => {
    const error = new AppError(ERROR_CODES.PET_NOT_FOUND, 'Pet not found');
    expect(error.statusCode).toBe(HTTP_STATUS.PET_NOT_FOUND);
    expect(error.code).toBe('PET_NOT_FOUND');
    expect(error.isOperational).toBe(true);
  });

  it('supports custom details', () => {
    const error = new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid input', {
      details: { field: 'name' },
    });
    expect(error.details).toEqual({ field: 'name' });
  });
});
