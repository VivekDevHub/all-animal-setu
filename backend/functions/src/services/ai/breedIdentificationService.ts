import { getStorageBucket } from '../../config/firebase';
import { assertActivePetOwner } from '../../shared/auth/authorization';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { logger } from '../../shared/logger/logger';
import { aiBreedIdentificationResponseSchema } from '../../modules/ai/ai.schema';
import {
  AIBreedIdentificationPayload,
  AIBreedIdentificationResponse,
} from '../../modules/ai/ai.types';
import { saveBreedIdentification } from '../../repositories/aiPlanRepository';
import { generateMultimodalStructuredContent } from './geminiClient';
import { createAuditLog } from '../audit/auditService';

export function buildBreedIdentificationSystemInstruction(): string {
  return `You are AnimalSetu AI Breed Classifier. You analyze pet photographs to estimate domestic animal species and breed composition.
POLICIES & DISCLAIMERS:
1. Visual identification is only an estimate and cannot substitute for genetic DNA testing or pedigree documentation.
2. If the image is unclear, blurry, or contains no animal, clearly state low confidence and explain why in the notes.
3. If mixed breed, list the most prominent observable traits as primaryBreed and include other probable ancestors in alternativeBreeds.
4. Confidence score must be a number between 0.0 and 1.0.
5. Return your output ONLY as valid JSON in this exact structure:
{
  "species": "Dog" | "Cat" | "Bird" | "Rabbit" | "Other",
  "primaryBreed": "Name of primary breed",
  "alternativeBreeds": ["Breed 1", "Breed 2"],
  "confidence": 0.85,
  "notes": "Observable morphological features (coat, ears, muzzle, build).",
  "disclaimer": "Breed identification from visual analysis is an estimate and not guaranteed."
}`;
}

export async function identifyPetBreed(
  userId: string,
  petId: string,
  imagePath: string,
): Promise<AIBreedIdentificationResponse> {
  // 1. Verify pet ownership
  const pet = await assertActivePetOwner(petId, userId);

  // 2. Strict storage path validation: must be within the authenticated user's pet folder
  const expectedPrefix = `users/${userId}/pets/${petId}/`;
  if (!imagePath.startsWith(expectedPrefix)) {
    throw new AppError(
      ERROR_CODES.STORAGE_ACCESS_DENIED,
      'Image path is not authorized for this pet and user.',
    );
  }

  // 3. Download image buffer from Firebase Storage
  const bucket = getStorageBucket();
  const file = bucket.file(imagePath);

  const [exists] = await file.exists();
  if (!exists) {
    throw new AppError(
      ERROR_CODES.DOCUMENT_NOT_FOUND,
      'Uploaded breed photo not found in storage.',
    );
  }

  const [metadata] = await file.getMetadata();
  const mimeType = metadata.contentType || 'image/jpeg';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new AppError(
      ERROR_CODES.INVALID_FILE_TYPE,
      'Only JPEG, PNG, and WebP images are supported for breed identification.',
    );
  }

  const [fileBuffer] = await file.download();

  logger.info('ai_breed_identification_started', {
    userId,
    petId,
    imagePath,
  });

  const prompt = `Please inspect this pet image and estimate the species and breed characteristics. The owner registered this pet as species: ${pet.species}.`;

  const raw = await generateMultimodalStructuredContent<unknown>({
    systemInstruction: buildBreedIdentificationSystemInstruction(),
    prompt,
    imageBuffer: fileBuffer,
    mimeType,
  });

  const validated = aiBreedIdentificationResponseSchema.parse(raw) as AIBreedIdentificationPayload;

  const saved = await saveBreedIdentification(pet.id!, userId, imagePath, validated);

  logger.info('ai_breed_identification_completed', {
    userId,
    petId,
    identificationId: saved.id,
    primaryBreed: saved.primaryBreed,
    confidence: saved.confidence,
  });

  void createAuditLog({
    userId,
    action: 'AI_BREED_IDENTIFIED',
    resourceType: 'PET_BREED_IDENTIFICATION',
    resourceId: saved.id,
    metadata: { petId: pet.id, primaryBreed: saved.primaryBreed },
  });

  return saved;
}
