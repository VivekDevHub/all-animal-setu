import multer from 'multer';
import { PET_PHOTO_LIMITS, FILE_LIMITS } from '../config/constants';

const storage = multer.memoryStorage();

export const petPhotoUpload = multer({
  storage,
  limits: {
    fileSize: PET_PHOTO_LIMITS.MAX_SIZE_BYTES,
    files: 1,
  },
});

export const documentUpload = multer({
  storage,
  limits: {
    fileSize: FILE_LIMITS.MAX_SIZE_BYTES,
    files: 1,
  },
});
