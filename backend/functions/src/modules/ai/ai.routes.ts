import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware';
import {
  breedIdentLimiter,
  dietPlanLimiter,
  exercisePlanLimiter,
  healthAssistantLimiter,
} from '../../middleware/rateLimitMiddleware';
import { validateBody, validateParams } from '../../middleware/validationMiddleware';
import { asyncHandler } from '../../middleware/errorMiddleware';
import {
  breedIdentificationInputSchema,
  conversationIdParamSchema,
  healthAssistantInputSchema,
  petIdBodySchema,
} from './ai.schema';
import {
  breedIdentificationHandler,
  createDietPlanHandler,
  createExercisePlanHandler,
  deleteConversationHandler,
  getConversationHandler,
  healthAssistantHandler,
  listConversationsHandler,
} from './ai.controller';

const router = Router();

// Health Assistant
router.post(
  '/health-assistant',
  authenticateUser,
  healthAssistantLimiter,
  validateBody(healthAssistantInputSchema),
  asyncHandler(healthAssistantHandler),
);

// AI Conversations
router.get('/conversations', authenticateUser, asyncHandler(listConversationsHandler));

router.get(
  '/conversations/:conversationId',
  authenticateUser,
  validateParams(conversationIdParamSchema),
  asyncHandler(getConversationHandler),
);

router.delete(
  '/conversations/:conversationId',
  authenticateUser,
  validateParams(conversationIdParamSchema),
  asyncHandler(deleteConversationHandler),
);

// AI Diet Plan
router.post(
  '/diet-plan',
  authenticateUser,
  dietPlanLimiter,
  validateBody(petIdBodySchema),
  asyncHandler(createDietPlanHandler),
);

// AI Exercise Plan
router.post(
  '/exercise-plan',
  authenticateUser,
  exercisePlanLimiter,
  validateBody(petIdBodySchema),
  asyncHandler(createExercisePlanHandler),
);

// AI Breed Identification
router.post(
  '/breed-identification',
  authenticateUser,
  breedIdentLimiter,
  validateBody(breedIdentificationInputSchema),
  asyncHandler(breedIdentificationHandler),
);

export { router as aiRouter };
