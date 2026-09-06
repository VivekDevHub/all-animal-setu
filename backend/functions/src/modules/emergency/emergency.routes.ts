import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware';
import { validateBody, validateParams } from '../../middleware/validationMiddleware';
import { asyncHandler } from '../../middleware/errorMiddleware';
import {
  createEmergencySchema,
  emergencyIdParamSchema,
  updateEmergencyStatusSchema,
} from './emergency.schema';
import {
  createEmergencyHandler,
  getEmergencyHandler,
  listEmergenciesHandler,
  updateEmergencyStatusHandler,
} from './emergency.controller';

const router = Router();

router.post(
  '/',
  authenticateUser,
  validateBody(createEmergencySchema),
  asyncHandler(createEmergencyHandler),
);

router.get(
  '/',
  authenticateUser,
  asyncHandler(listEmergenciesHandler),
);

router.get(
  '/:emergencyId',
  authenticateUser,
  validateParams(emergencyIdParamSchema),
  asyncHandler(getEmergencyHandler),
);

router.patch(
  '/:emergencyId',
  authenticateUser,
  validateParams(emergencyIdParamSchema),
  validateBody(updateEmergencyStatusSchema),
  asyncHandler(updateEmergencyStatusHandler),
);

export { router as emergencyRouter };
