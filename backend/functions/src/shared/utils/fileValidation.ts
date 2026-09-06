import { AppError, ERROR_CODES } from '../errors';

interface FileValidationOptions {
  maxSizeBytes: number;
  allowedMimeTypes: readonly string[];
}

export function validateUploadedFile(
  file: Express.Multer.File | undefined,
  options: FileValidationOptions,
): Express.Multer.File {
  if (!file) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'File is required');
  }

  if (file.size > options.maxSizeBytes) {
    throw new AppError(ERROR_CODES.FILE_TOO_LARGE, 'File exceeds maximum allowed size');
  }

  const mimeType = file.mimetype.toLowerCase();
  const allowed = options.allowedMimeTypes.map((type) => type.toLowerCase());

  if (!allowed.includes(mimeType)) {
    throw new AppError(ERROR_CODES.INVALID_FILE_TYPE, 'Unsupported file type');
  }

  return file;
}

export function extensionForMimeType(mimeType: string): string {
  switch (mimeType.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'application/pdf':
      return 'pdf';
    default:
      return 'bin';
  }
}
