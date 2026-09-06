import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware';
import { validateBody, validateParams } from '../../middleware/validationMiddleware';
import { asyncHandler } from '../../middleware/errorMiddleware';
import { petIdParamSchema } from '../../shared/schemas/common.schema';
import { upsertHealthPassportSchema } from './healthPassport.schema';
import {
  getHealthPassportHandler,
  upsertHealthPassportHandler,
} from './healthPassport.controller';

const router = Router({ mergeParams: true });

router.get(
  '/',
  authenticateUser,
  validateParams(petIdParamSchema),
  asyncHandler(getHealthPassportHandler),
);

router.put(
  '/',
  authenticateUser,
  validateParams(petIdParamSchema),
  validateBody(upsertHealthPassportSchema),
  asyncHandler(upsertHealthPassportHandler),
);

export { router as healthPassportRouter };
