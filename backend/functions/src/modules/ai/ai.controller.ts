import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { assertAuthenticated } from '../../shared/auth/authorization';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { processHealthAssistant } from '../../services/ai/healthAssistantService';
import { generateDietPlan } from '../../services/ai/dietPlannerService';
import { generateExercisePlan } from '../../services/ai/exercisePlannerService';
import { identifyPetBreed } from '../../services/ai/breedIdentificationService';
import {
  deleteConversation,
  findConversationById,
  getRecentMessages,
  listConversationsForUser,
} from '../../repositories/aiConversationRepository';
import {
  getDietPlanById,
  getExercisePlanById,
  listDietPlansForPet,
  listExercisePlansForPet,
} from '../../repositories/aiPlanRepository';
import { assertActivePetOwner } from '../../shared/auth/authorization';

// --- Health Assistant ---

export async function healthAssistantHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const result = await processHealthAssistant(user.uid, req.body);
  sendSuccess(res, result, { statusCode: 200 });
}

// --- Conversations ---

export async function listConversationsHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const conversations = await listConversationsForUser(user.uid);
  sendSuccess(res, { conversations }, { statusCode: 200 });
}

export async function getConversationHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const conversationId = req.params.conversationId as string;

  const conv = await findConversationById(conversationId);
  if (!conv || conv.userId !== user.uid) {
    throw new AppError(ERROR_CODES.CONVERSATION_NOT_FOUND, 'Conversation not found');
  }

  const messages = await getRecentMessages(conversationId, 50);
  sendSuccess(res, { ...conv, messages }, { statusCode: 200 });
}

export async function deleteConversationHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const conversationId = req.params.conversationId as string;

  const conv = await findConversationById(conversationId);
  if (!conv || conv.userId !== user.uid) {
    throw new AppError(ERROR_CODES.CONVERSATION_NOT_FOUND, 'Conversation not found');
  }

  await deleteConversation(conversationId);
  sendSuccess(res, { deleted: true }, { statusCode: 200 });
}

// --- Diet Plans ---

export async function createDietPlanHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const { petId } = req.body;
  const plan = await generateDietPlan(user.uid, petId);
  sendSuccess(res, plan, { statusCode: 201 });
}

export async function listDietPlansHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  await assertActivePetOwner(petId, user.uid);

  const plans = await listDietPlansForPet(petId);
  sendSuccess(res, { plans }, { statusCode: 200 });
}

export async function getDietPlanHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const planId = req.params.planId as string;
  await assertActivePetOwner(petId, user.uid);

  const plan = await getDietPlanById(petId, planId);
  if (!plan) {
    throw new AppError(ERROR_CODES.DIET_PLAN_NOT_FOUND, 'Diet plan not found');
  }

  sendSuccess(res, plan, { statusCode: 200 });
}

// --- Exercise Plans ---

export async function createExercisePlanHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const { petId } = req.body;
  const plan = await generateExercisePlan(user.uid, petId);
  sendSuccess(res, plan, { statusCode: 201 });
}

export async function listExercisePlansHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  await assertActivePetOwner(petId, user.uid);

  const plans = await listExercisePlansForPet(petId);
  sendSuccess(res, { plans }, { statusCode: 200 });
}

export async function getExercisePlanHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const planId = req.params.planId as string;
  await assertActivePetOwner(petId, user.uid);

  const plan = await getExercisePlanById(petId, planId);
  if (!plan) {
    throw new AppError(ERROR_CODES.EXERCISE_PLAN_NOT_FOUND, 'Exercise plan not found');
  }

  sendSuccess(res, plan, { statusCode: 200 });
}

// --- Breed Identification ---

export async function breedIdentificationHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const { petId, imagePath } = req.body;
  const result = await identifyPetBreed(user.uid, petId, imagePath);
  sendSuccess(res, result, { statusCode: 200 });
}
