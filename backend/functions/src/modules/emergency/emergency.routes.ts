import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware';
import { validateBody, validateParams } from '../../middleware/validationMiddleware';
import { asyncHandler } from '../../middleware/errorMiddleware';
import {
  createEmergencySchema,
  emergencyIdParamSchema,
  petIdParamSchema,
  updateEmergencyStatusSchema,
} from './emergency.schema';
import {
  createEmergencyHandler,
  getEmergencyCardHandler,
  getEmergencyHandler,
  listEmergenciesHandler,
  updateEmergencyStatusHandler,
} from './emergency.controller';

const router = Router();

// Create an emergency
router.post(
  '/',
  authenticateUser,
  validateBody(createEmergencySchema),
  asyncHandler(createEmergencyHandler),
);

// List user's emergencies
router.get(
  '/',
  authenticateUser,
  asyncHandler(listEmergenciesHandler),
);

// Get emergency card for a pet (must be declared BEFORE /:emergencyId to avoid route collision)
router.get(
  '/card/:petId',
  authenticateUser,
  validateParams(petIdParamSchema),
  asyncHandler(getEmergencyCardHandler),
);

// Get emergency by ID
router.get(
  '/:emergencyId',
  authenticateUser,
  validateParams(emergencyIdParamSchema),
  asyncHandler(getEmergencyHandler),
);

// Update emergency status
router.patch(
  '/:emergencyId',
  authenticateUser,
  validateParams(emergencyIdParamSchema),
  validateBody(updateEmergencyStatusSchema),
  asyncHandler(updateEmergencyStatusHandler),
);

export { router as emergencyRouter };
