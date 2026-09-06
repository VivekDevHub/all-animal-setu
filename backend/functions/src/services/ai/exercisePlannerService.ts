import { getEnv } from '../../config/env';
import { assertActivePetOwner } from '../../shared/auth/authorization';
import { logger } from '../../shared/logger/logger';
import { aiExercisePlanResponseSchema } from '../../modules/ai/ai.schema';
import { AIExercisePlanPayload, AIExercisePlanResponse } from '../../modules/ai/ai.types';
import { saveExercisePlan } from '../../repositories/aiPlanRepository';
import { generateStructuredContent } from './geminiClient';
import { createAuditLog } from '../audit/auditService';

export function buildExercisePlannerSystemInstruction(): string {
  return `You are AnimalSetu AI Pet Activity & Exercise Coach. You provide safe physical activity and mental enrichment guidance for domestic pets. You are NOT a veterinary orthopedic specialist.
SAFETY & EXERCISE POLICIES:
1. NEVER recommend high-impact or strenuous exercise for pets with arthritis, cardiac conditions, dysplasia, post-surgery recovery, or brachycephalic airway syndrome.
2. If the pet has documented health conditions or is senior/puppy/kitten, keep intensity low or moderate and require professional vet clearance.
3. Recommend age-appropriate duration, mental enrichment (puzzle toys, scent games), rest intervals, and weather precautions (heatstroke prevention, cold protection).
4. Return your output ONLY as valid JSON in this exact structure:
{
  "summary": "Brief 1-2 sentence overview of activity philosophy for this pet",
  "dailyActivityRecommendations": [
    {
      "activity": "e.g. Brisk morning neighborhood walk",
      "durationMinutes": 20,
      "intensity": "LOW" | "MODERATE" | "HIGH"
    }
  ],
  "weeklyFrequency": "e.g. 5-7 days per week",
  "enrichmentActivities": [
    "Activity 1",
    "Activity 2"
  ],
  "restGuidance": [
    "Rest rule 1",
    "Rest rule 2"
  ],
  "precautions": [
    "Precaution 1",
    "Precaution 2"
  ],
  "professionalReviewRecommended": boolean
}`;
}

export async function generateExercisePlan(
  userId: string,
  petId: string,
): Promise<AIExercisePlanResponse> {
  const pet = await assertActivePetOwner(petId, userId);
  const env = getEnv();

  const hasHealthRestrictions =
    pet.medicalConditions && pet.medicalConditions.length > 0;

  const prompt = `Create a customized, safe physical activity & enrichment plan for:
- Species: ${pet.species}
- Breed: ${pet.breed || 'Mixed / Unknown'}
- Weight: ${pet.weight ? `${pet.weight} ${pet.weightUnit}` : 'Not recorded'}
- Gender: ${pet.gender || 'Unknown'}
- Known Medical Conditions & Physical Restrictions: ${
    pet.medicalConditions?.length ? pet.medicalConditions.join(', ') : 'None reported'
  }

${
  hasHealthRestrictions
    ? 'NOTE: The pet has medical conditions. Ensure no activities exacerbate these conditions, set professionalReviewRecommended to true, and add clear precautions.'
    : ''
}

Generate the structured JSON exercise plan now.`;

  logger.info('ai_exercise_plan_started', { userId, petId });

  const raw = await generateStructuredContent<unknown>({
    systemInstruction: buildExercisePlannerSystemInstruction(),
    prompt,
  });

  const parsed = aiExercisePlanResponseSchema.parse(raw) as AIExercisePlanPayload;

  if (hasHealthRestrictions) {
    parsed.professionalReviewRecommended = true;
  }

  const saved = await saveExercisePlan(pet.id!, userId, env.GEMINI_MODEL, parsed);

  logger.info('ai_exercise_plan_completed', { userId, petId, planId: saved.id });

  void createAuditLog({
    userId,
    action: 'AI_EXERCISE_PLAN_CREATED',
    resourceType: 'PET_EXERCISE_PLAN',
    resourceId: saved.id,
    metadata: { petId: pet.id },
  });

  return saved;
}
