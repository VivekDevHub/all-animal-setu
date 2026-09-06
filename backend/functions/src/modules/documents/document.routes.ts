import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware';
import { uploadRateLimiter } from '../../middleware/rateLimitMiddleware';
import { validateBody, validateParams } from '../../middleware/validationMiddleware';
import { asyncHandler } from '../../middleware/errorMiddleware';
import { documentUpload } from '../../middleware/uploadMiddleware';
import { documentIdParamSchema } from '../../shared/schemas/common.schema';
import { confirmOcrSchema } from './document.schema';
import {
  confirmOcrHandler,
  getDocumentHandler,
  triggerOcrHandler,
  uploadDocumentHandler,
} from './document.controller';

const router = Router();

router.post(
  '/upload',
  authenticateUser,
  uploadRateLimiter,
  documentUpload.single('file'),
  asyncHandler(uploadDocumentHandler),
);

router.get(
  '/:documentId',
  authenticateUser,
  validateParams(documentIdParamSchema),
  asyncHandler(getDocumentHandler),
);

router.post(
  '/:documentId/ocr',
  authenticateUser,
  validateParams(documentIdParamSchema),
  asyncHandler(triggerOcrHandler),
);

router.post(
  '/:documentId/confirm',
  authenticateUser,
  validateParams(documentIdParamSchema),
  validateBody(confirmOcrSchema),
  asyncHandler(confirmOcrHandler),
);

export { router as documentRouter };
