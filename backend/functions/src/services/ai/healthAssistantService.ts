import {
  DETERMINISTIC_EMERGENCY_KEYWORDS,
  HEALTH_DISCLAIMER,
} from '../../config/constants';
import { assertActivePetOwner } from '../../shared/auth/authorization';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { logger } from '../../shared/logger/logger';
import {
  aiHealthResponseSchema,
  healthAssistantInputSchema,
} from '../../modules/ai/ai.schema';
import {
  AIHealthAssistantInput,
  AIHealthAssistantResponse,
  AIHealthResponsePayload,
} from '../../modules/ai/ai.types';
import {
  addMessageToConversation,
  createConversation,
  findConversationById,
  getRecentMessages,
} from '../../repositories/aiConversationRepository';
import { generateStructuredContent } from './geminiClient';
import { getHealthPassport } from '../../modules/health/healthPassport.service';
import { createAuditLog } from '../audit/auditService';

export function isDeterministicEmergency(message: string): boolean {
  const lower = message.toLowerCase();
  return DETERMINISTIC_EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

export function buildSystemInstruction(): string {
  return `You are AnimalSetu AI, a pet healthcare educational assistant. You are NOT a licensed veterinarian.
CRITICAL SAFETY & TRIAGE POLICIES:
1. NEVER diagnose a pet definitively. Use tentative phrases such as "Possible areas of concern include..."
2. NEVER prescribe medications or suggest specific drug dosages.
3. NEVER instruct an owner to delay veterinary examination.
4. Always categorize urgency into exactly one of: LOW, MODERATE, URGENT, EMERGENCY.
   - LOW: Minor behavioral or mild temporary symptoms (e.g. minor scratch, single sneeze, slight diet change).
   - MODERATE: Symptoms requiring monitoring or a non-emergency vet check if not improving within 24-48h.
   - URGENT: Severe discomfort, repetitive vomiting/diarrhea, lethargy, significant injury, requiring same-day vet visit.
   - EMERGENCY: Critical, life-threatening symptoms (breathing difficulty, seizures, poisoning, collapse, unconsciousness, severe bleeding, bloat).
5. If urgency is EMERGENCY or URGENT, set recommendedProfessionalCare to true and shouldFindNearbyVet to true.
6. Provide concise, mobile-friendly responses with practical, safe supportive guidance.
7. Return your response ONLY as valid JSON matching this exact structure:
{
  "urgency": "LOW" | "MODERATE" | "URGENT" | "EMERGENCY",
  "summary": "Brief 1-2 sentence overview",
  "possibleConcerns": ["item 1", "item 2"],
  "recommendedActions": ["step 1", "step 2"],
  "warningSigns": ["sign 1", "sign 2"],
  "recommendedProfessionalCare": boolean,
  "shouldFindNearbyVet": boolean,
  "disclaimer": "${HEALTH_DISCLAIMER}"
}`;
}

export async function processHealthAssistant(
  userId: string,
  input: AIHealthAssistantInput,
): Promise<AIHealthAssistantResponse> {
  // 1. Validate input schema
  const parsedInput = healthAssistantInputSchema.parse(input);

  // 2. Verify pet ownership and active status
  const pet = await assertActivePetOwner(parsedInput.petId, userId);

  // 3. Resolve or create conversation
  let conversationId = parsedInput.conversationId;
  if (conversationId) {
    const existing = await findConversationById(conversationId);
    if (!existing || existing.userId !== userId || existing.petId !== pet.id) {
      throw new AppError(
        ERROR_CODES.CONVERSATION_NOT_FOUND,
        'Conversation not found or access denied',
      );
    }
  } else {
    const newConv = await createConversation(userId, pet.id!);
    conversationId = newConv.id;
  }

  // 4. Save incoming user message
  await addMessageToConversation(conversationId, {
    role: 'user',
    content: parsedInput.message,
  });

  // 5. Check deterministic emergency keywords
  const emergencyTriggered = isDeterministicEmergency(parsedInput.message);

  // 6. Gather minimized pet context
  let healthSummary = '';
  try {
    const passport = await getHealthPassport(pet.id!, userId);
    if (passport.currentMedicationsSummary?.length) {
      healthSummary += `Medications: ${passport.currentMedicationsSummary.join(', ')}. `;
    }
  } catch {
    // Health passport optional
  }

  const petContext = `Pet Context:
- Species: ${pet.species}
- Breed: ${pet.breed || 'Unknown'}
- Weight: ${pet.weight ? `${pet.weight} ${pet.weightUnit}` : 'Unknown'}
- Known Allergies: ${pet.allergies?.length ? pet.allergies.join(', ') : 'None reported'}
- Medical Conditions: ${pet.medicalConditions?.length ? pet.medicalConditions.join(', ') : 'None reported'}
${healthSummary}`;

  // 7. Load recent conversation history (max 10)
  const history = await getRecentMessages(conversationId, 10);
  const historyText = history
    .map((m) => `${m.role === 'user' ? 'Owner' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = `${petContext}

Recent Conversation:
${historyText}

Current Owner Query: "${parsedInput.message}"
${
  emergencyTriggered
    ? 'NOTE: The message contains critical emergency keywords. You MUST mark urgency as EMERGENCY and recommend immediate veterinary intervention.'
    : ''
}

Provide your structured JSON assessment now.`;

  logger.info('ai_request_started', {
    userId,
    petId: pet.id,
    conversationId,
    emergencyTriggered,
  });

  let structuredResponse: AIHealthResponsePayload;

  try {
    const rawAiResult = await generateStructuredContent<unknown>({
      systemInstruction: buildSystemInstruction(),
      prompt,
    });

    const validated = aiHealthResponseSchema.parse(rawAiResult);
    structuredResponse = validated;
  } catch (error) {
    if (emergencyTriggered) {
      // Deterministic fallback if AI is down during a critical emergency
      structuredResponse = {
        urgency: 'EMERGENCY',
        summary:
          'Critical emergency indicators detected in your pet description. Immediate professional veterinary intervention is required.',
        possibleConcerns: ['Acute distress', 'Severe medical emergency requiring immediate triage'],
        recommendedActions: [
          'Seek immediate emergency veterinary care without delay.',
          'Keep your pet calm and minimize movement during transport.',
          'Call ahead to the nearest veterinary emergency clinic.',
        ],
        warningSigns: [
          'Difficulty breathing or rapid shallow breaths',
          'Loss of consciousness or unresponsiveness',
          'Severe bleeding, tremors, or continuous seizures',
        ],
        recommendedProfessionalCare: true,
        shouldFindNearbyVet: true,
        disclaimer: HEALTH_DISCLAIMER,
      };
    } else {
      logger.error('ai_request_failed', {
        userId,
        petId: pet.id,
        conversationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // Enforce deterministic emergency overrides if detected
  if (emergencyTriggered) {
    structuredResponse.urgency = 'EMERGENCY';
    structuredResponse.recommendedProfessionalCare = true;
    structuredResponse.shouldFindNearbyVet = true;
  }

  // 8. Save assistant response to conversation
  const savedMessage = await addMessageToConversation(conversationId, {
    role: 'assistant',
    content: structuredResponse.summary,
    urgency: structuredResponse.urgency,
    structuredResponse,
  });

  logger.info('ai_request_completed', {
    userId,
    petId: pet.id,
    conversationId,
    urgency: structuredResponse.urgency,
  });

  if (structuredResponse.urgency === 'EMERGENCY') {
    void createAuditLog({
      userId,
      action: 'AI_EMERGENCY_DETECTED',
      resourceType: 'AI_CONVERSATION',
      resourceId: conversationId,
      metadata: { petId: pet.id, urgency: structuredResponse.urgency },
    });
  }

  return {
    ...structuredResponse,
    conversationId,
    messageId: savedMessage.id,
    petId: pet.id!,
    createdAt: savedMessage.createdAt,
  };
}
