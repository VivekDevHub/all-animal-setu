import { getEnv } from '../../config/env';
import { assertActivePetOwner } from '../../shared/auth/authorization';
import { logger } from '../../shared/logger/logger';
import { aiDietPlanResponseSchema } from '../../modules/ai/ai.schema';
import { AIDietPlanPayload, AIDietPlanResponse } from '../../modules/ai/ai.types';
import { saveDietPlan } from '../../repositories/aiPlanRepository';
import { generateStructuredContent } from './geminiClient';
import { createAuditLog } from '../audit/auditService';

export function buildDietPlannerSystemInstruction(): string {
  return `You are AnimalSetu AI Pet Nutrition Assistant. You provide general, educational feeding guidelines for domestic pets. You are NOT a veterinary nutritionist.
SAFETY & NUTRITION POLICIES:
1. NEVER prescribe prescription medical diets or therapeutic diets as a licensed practitioner.
2. If the pet has allergies or pre-existing medical conditions, highlight that nutritional choices must be confirmed with a licensed veterinarian.
3. Provide realistic portion guidelines, safe common foods, foods strictly to avoid (e.g. chocolate, grapes, onions, xylitol for dogs/cats), and hydration tips.
4. Return your output ONLY as valid JSON in this exact structure:
{
  "summary": "Brief 1-2 sentence overview of daily nutritional focus",
  "feedingSchedule": [
    {
      "timeOfDay": "Morning",
      "portion": "e.g. 1 cup high-protein kibble or balanced home meal",
      "notes": "Optional feeding tip"
    },
    {
      "timeOfDay": "Evening",
      "portion": "e.g. 1 cup kibble with warm water",
      "notes": "Optional feeding tip"
    }
  ],
  "generalFoodGuidelines": [
    "Guideline 1",
    "Guideline 2"
  ],
  "foodsToAvoid": [
    "Item 1 (reason)",
    "Item 2 (reason)"
  ],
  "hydrationTips": [
    "Hydration tip 1",
    "Hydration tip 2"
  ],
  "professionalReviewRecommended": boolean
}`;
}

export async function generateDietPlan(
  userId: string,
  petId: string,
): Promise<AIDietPlanResponse> {
  const pet = await assertActivePetOwner(petId, userId);
  const env = getEnv();

  const hasSpecialConditions =
    (pet.allergies && pet.allergies.length > 0) ||
    (pet.medicalConditions && pet.medicalConditions.length > 0);

  const prompt = `Create a general pet nutrition and feeding plan for:
- Species: ${pet.species}
- Breed: ${pet.breed || 'Mixed / Unknown'}
- Weight: ${pet.weight ? `${pet.weight} ${pet.weightUnit}` : 'Average adult weight'}
- Gender: ${pet.gender || 'Unknown'}
- Known Allergies: ${pet.allergies?.length ? pet.allergies.join(', ') : 'None reported'}
- Known Medical Conditions: ${pet.medicalConditions?.length ? pet.medicalConditions.join(', ') : 'None reported'}

${
  hasSpecialConditions
    ? 'NOTE: This pet has recorded allergies or medical conditions. Ensure professionalReviewRecommended is true and emphasize veterinarian review.'
    : ''
}

Generate the structured JSON diet plan now.`;

  logger.info('ai_diet_plan_started', { userId, petId });

  const raw = await generateStructuredContent<unknown>({
    systemInstruction: buildDietPlannerSystemInstruction(),
    prompt,
  });

  const parsed = aiDietPlanResponseSchema.parse(raw) as AIDietPlanPayload;

  if (hasSpecialConditions) {
    parsed.professionalReviewRecommended = true;
  }

  const saved = await saveDietPlan(pet.id!, userId, env.GEMINI_MODEL, parsed);

  logger.info('ai_diet_plan_completed', { userId, petId, planId: saved.id });

  void createAuditLog({
    userId,
    action: 'AI_DIET_PLAN_CREATED',
    resourceType: 'PET_DIET_PLAN',
    resourceId: saved.id,
    metadata: { petId: pet.id },
  });

  return saved;
}
