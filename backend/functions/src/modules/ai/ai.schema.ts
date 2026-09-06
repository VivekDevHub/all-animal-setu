import { z } from 'zod';
import { AI_LIMITS, AI_URGENCY_LEVELS } from '../../config/constants';

// --- Inputs ---

export const healthAssistantInputSchema = z.object({
  petId: z.string().min(1, 'petId is required'),
  message: z.string().trim().min(1, 'message is required').max(AI_LIMITS.MAX_MESSAGE_LENGTH),
  conversationId: z.string().trim().min(1).optional(),
});

export const conversationIdParamSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
});

export const planIdParamSchema = z.object({
  petId: z.string().min(1, 'petId is required'),
  planId: z.string().min(1, 'planId is required'),
});

export const breedIdentificationInputSchema = z.object({
  petId: z.string().min(1, 'petId is required'),
  imagePath: z
    .string()
    .min(1, 'imagePath is required')
    .refine((path) => path.startsWith('users/'), {
      message: 'imagePath must point to a secure user storage location',
    }),
});

export const petIdBodySchema = z.object({
  petId: z.string().min(1, 'petId is required'),
});

// --- AI Output Validations (Zod) ---

export const aiHealthResponseSchema = z.object({
  urgency: z.enum(AI_URGENCY_LEVELS),
  summary: z.string().min(1),
  possibleConcerns: z.array(z.string()).default([]),
  recommendedActions: z.array(z.string()).default([]),
  warningSigns: z.array(z.string()).default([]),
  recommendedProfessionalCare: z.boolean().default(false),
  shouldFindNearbyVet: z.boolean().default(false),
  disclaimer: z.string().min(1),
});

export const aiDietPlanResponseSchema = z.object({
  summary: z.string().min(1),
  feedingSchedule: z
    .array(
      z.object({
        timeOfDay: z.string().min(1),
        portion: z.string().min(1),
        notes: z.string().optional(),
      }),
    )
    .min(1),
  generalFoodGuidelines: z.array(z.string()).default([]),
  foodsToAvoid: z.array(z.string()).default([]),
  hydrationTips: z.array(z.string()).default([]),
  professionalReviewRecommended: z.boolean().default(true),
});

export const aiExercisePlanResponseSchema = z.object({
  summary: z.string().min(1),
  dailyActivityRecommendations: z
    .array(
      z.object({
        activity: z.string().min(1),
        durationMinutes: z.number().int().positive(),
        intensity: z.enum(['LOW', 'MODERATE', 'HIGH']),
      }),
    )
    .min(1),
  weeklyFrequency: z.string().min(1),
  enrichmentActivities: z.array(z.string()).default([]),
  restGuidance: z.array(z.string()).default([]),
  precautions: z.array(z.string()).default([]),
  professionalReviewRecommended: z.boolean().default(false),
});

export const aiBreedIdentificationResponseSchema = z.object({
  species: z.string().min(1),
  primaryBreed: z.string().min(1),
  alternativeBreeds: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  notes: z.string().default(''),
  disclaimer: z.string().min(1),
});
