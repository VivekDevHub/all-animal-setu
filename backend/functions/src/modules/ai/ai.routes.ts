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
  planIdParamSchema,
} from './ai.schema';
import {
  breedIdentificationHandler,
  createDietPlanHandler,
  createExercisePlanHandler,
  deleteConversationHandler,
  getDietPlanHandler,
  getConversationHandler,
  getExercisePlanHandler,
  healthAssistantHandler,
  listConversationsHandler,
  listDietPlansHandler,
  listExercisePlansHandler,
} from './ai.controller';

const router = Router();

// --- Health Assistant ---
router.post(
  '/health-assistant',
  authenticateUser,
  healthAssistantLimiter,
  validateBody(healthAssistantInputSchema),
  asyncHandler(healthAssistantHandler),
);

// --- AI Conversations ---
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

// --- AI Diet Plans ---
router.post(
  '/diet-plan',
  authenticateUser,
  dietPlanLimiter,
  validateBody(petIdBodySchema),
  asyncHandler(createDietPlanHandler),
);

router.get(
  '/diet-plans/:petId',
  authenticateUser,
  asyncHandler(listDietPlansHandler),
);

router.get(
  '/diet-plans/:petId/:planId',
  authenticateUser,
  validateParams(planIdParamSchema),
  asyncHandler(getDietPlanHandler),
);

// --- AI Exercise Plans ---
router.post(
  '/exercise-plan',
  authenticateUser,
  exercisePlanLimiter,
  validateBody(petIdBodySchema),
  asyncHandler(createExercisePlanHandler),
);

router.get(
  '/exercise-plans/:petId',
  authenticateUser,
  asyncHandler(listExercisePlansHandler),
);

router.get(
  '/exercise-plans/:petId/:planId',
  authenticateUser,
  validateParams(planIdParamSchema),
  asyncHandler(getExercisePlanHandler),
);

// --- AI Breed Identification ---
router.post(
  '/breed-identification',
  authenticateUser,
  breedIdentLimiter,
  validateBody(breedIdentificationInputSchema),
  asyncHandler(breedIdentificationHandler),
);

export { router as aiRouter };
