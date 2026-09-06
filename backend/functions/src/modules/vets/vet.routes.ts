import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware';
import { placesLimiter } from '../../middleware/rateLimitMiddleware';
import { validateQuery } from '../../middleware/validationMiddleware';
import { asyncHandler } from '../../middleware/errorMiddleware';
import { nearbyVetsQuerySchema } from './vet.schema';
import { getNearbyVetsHandler } from './vet.controller';

const router = Router();

router.get(
  '/nearby',
  authenticateUser,
  placesLimiter,
  validateQuery(nearbyVetsQuerySchema),
  asyncHandler(getNearbyVetsHandler),
);

export { router as vetRouter };
