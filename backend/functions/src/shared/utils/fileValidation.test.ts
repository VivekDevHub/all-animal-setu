import { describe, it, expect } from 'vitest';
import { validateUploadedFile } from './fileValidation';
import { AppError, ERROR_CODES } from '../errors';

describe('validateUploadedFile', () => {
  it('accepts valid image upload', () => {
    const file = {
      mimetype: 'image/jpeg',
      size: 1024,
    } as Express.Multer.File;

    expect(validateUploadedFile(file, {
      maxSizeBytes: 2048,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    })).toBe(file);
  });

  it('rejects missing file', () => {
    expect(() =>
      validateUploadedFile(undefined, {
        maxSizeBytes: 2048,
        allowedMimeTypes: ['image/jpeg'],
      }),
    ).toThrowError(
      expect.objectContaining({
        code: ERROR_CODES.VALIDATION_ERROR,
      }),
    );
  });

  it('rejects oversized file', () => {
    const file = {
      mimetype: 'image/jpeg',
      size: 999999,
    } as Express.Multer.File;

    expect(() =>
      validateUploadedFile(file, {
        maxSizeBytes: 100,
        allowedMimeTypes: ['image/jpeg'],
      }),
    ).toThrowError(
      expect.objectContaining({
        code: ERROR_CODES.FILE_TOO_LARGE,
      }),
    );
  });

  it('rejects invalid file type', () => {
    const file = {
      mimetype: 'application/javascript',
      size: 100,
    } as Express.Multer.File;

    expect(() =>
      validateUploadedFile(file, {
        maxSizeBytes: 2048,
        allowedMimeTypes: ['image/jpeg'],
      }),
    ).toThrowError(
      expect.objectContaining({
        code: ERROR_CODES.INVALID_FILE_TYPE,
      }),
    );
  });
});
