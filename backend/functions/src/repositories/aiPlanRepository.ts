import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirestore } from '../config/firebase';
import { COLLECTIONS, SUBCOLLECTIONS } from '../config/constants';
import {
  AIBreedIdentificationPayload,
  AIBreedIdentificationRecord,
  AIBreedIdentificationResponse,
  AIDietPlanPayload,
  AIDietPlanRecord,
  AIDietPlanResponse,
  AIExercisePlanPayload,
  AIExercisePlanRecord,
  AIExercisePlanResponse,
} from '../modules/ai/ai.types';
import { timestampToIso } from '../shared/utils/serialize';

// --- Diet Plans ---

function toDietPlanResponse(record: AIDietPlanRecord): AIDietPlanResponse {
  return {
    id: record.id!,
    petId: record.petId,
    summary: record.summary,
    feedingSchedule: record.feedingSchedule,
    generalFoodGuidelines: record.generalFoodGuidelines,
    foodsToAvoid: record.foodsToAvoid,
    hydrationTips: record.hydrationTips,
    professionalReviewRecommended: record.professionalReviewRecommended,
    model: record.model,
    version: record.version,
    createdBy: record.createdBy,
    createdAt: timestampToIso(record.createdAt as Timestamp)!,
  };
}

export async function saveDietPlan(
  petId: string,
  userId: string,
  model: string,
  plan: AIDietPlanPayload,
): Promise<AIDietPlanResponse> {
  const db = getFirestore();
  const docRef = db
    .collection(COLLECTIONS.PETS)
    .doc(petId)
    .collection(SUBCOLLECTIONS.AI_DIET_PLANS)
    .doc();

  const record: Omit<AIDietPlanRecord, 'id'> = {
    ...plan,
    petId,
    createdBy: userId,
    model,
    version: 1,
    createdAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(record);
  const created = await docRef.get();
  return toDietPlanResponse({ id: created.id, ...created.data() } as AIDietPlanRecord);
}

export async function listDietPlansForPet(
  petId: string,
  limitCount = 20,
): Promise<AIDietPlanResponse[]> {
  const snapshot = await getFirestore()
    .collection(COLLECTIONS.PETS)
    .doc(petId)
    .collection(SUBCOLLECTIONS.AI_DIET_PLANS)
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get();

  return snapshot.docs.map((doc) =>
    toDietPlanResponse({ id: doc.id, ...doc.data() } as AIDietPlanRecord),
  );
}

export async function getDietPlanById(
  petId: string,
  planId: string,
): Promise<AIDietPlanResponse | null> {
  const doc = await getFirestore()
    .collection(COLLECTIONS.PETS)
    .doc(petId)
    .collection(SUBCOLLECTIONS.AI_DIET_PLANS)
    .doc(planId)
    .get();

  if (!doc.exists) {
    return null;
  }
  return toDietPlanResponse({ id: doc.id, ...doc.data() } as AIDietPlanRecord);
}

// --- Exercise Plans ---

function toExercisePlanResponse(record: AIExercisePlanRecord): AIExercisePlanResponse {
  return {
    id: record.id!,
    petId: record.petId,
    summary: record.summary,
    dailyActivityRecommendations: record.dailyActivityRecommendations,
    weeklyFrequency: record.weeklyFrequency,
    enrichmentActivities: record.enrichmentActivities,
    restGuidance: record.restGuidance,
    precautions: record.precautions,
    professionalReviewRecommended: record.professionalReviewRecommended,
    model: record.model,
    version: record.version,
    createdBy: record.createdBy,
    createdAt: timestampToIso(record.createdAt as Timestamp)!,
  };
}

export async function saveExercisePlan(
  petId: string,
  userId: string,
  model: string,
  plan: AIExercisePlanPayload,
): Promise<AIExercisePlanResponse> {
  const db = getFirestore();
  const docRef = db
    .collection(COLLECTIONS.PETS)
    .doc(petId)
    .collection(SUBCOLLECTIONS.AI_EXERCISE_PLANS)
    .doc();

  const record: Omit<AIExercisePlanRecord, 'id'> = {
    ...plan,
    petId,
    createdBy: userId,
    model,
    version: 1,
    createdAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(record);
  const created = await docRef.get();
  return toExercisePlanResponse({ id: created.id, ...created.data() } as AIExercisePlanRecord);
}

export async function listExercisePlansForPet(
  petId: string,
  limitCount = 20,
): Promise<AIExercisePlanResponse[]> {
  const snapshot = await getFirestore()
    .collection(COLLECTIONS.PETS)
    .doc(petId)
    .collection(SUBCOLLECTIONS.AI_EXERCISE_PLANS)
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get();

  return snapshot.docs.map((doc) =>
    toExercisePlanResponse({ id: doc.id, ...doc.data() } as AIExercisePlanRecord),
  );
}

export async function getExercisePlanById(
  petId: string,
  planId: string,
): Promise<AIExercisePlanResponse | null> {
  const doc = await getFirestore()
    .collection(COLLECTIONS.PETS)
    .doc(petId)
    .collection(SUBCOLLECTIONS.AI_EXERCISE_PLANS)
    .doc(planId)
    .get();

  if (!doc.exists) {
    return null;
  }
  return toExercisePlanResponse({ id: doc.id, ...doc.data() } as AIExercisePlanRecord);
}

// --- Breed Identifications ---

function toBreedIdentificationResponse(
  record: AIBreedIdentificationRecord,
): AIBreedIdentificationResponse {
  return {
    id: record.id!,
    petId: record.petId,
    species: record.species,
    primaryBreed: record.primaryBreed,
    alternativeBreeds: record.alternativeBreeds,
    confidence: record.confidence,
    notes: record.notes,
    disclaimer: record.disclaimer,
    imagePath: record.imagePath,
    createdBy: record.createdBy,
    createdAt: timestampToIso(record.createdAt as Timestamp)!,
  };
}

export async function saveBreedIdentification(
  petId: string,
  userId: string,
  imagePath: string,
  data: AIBreedIdentificationPayload,
): Promise<AIBreedIdentificationResponse> {
  const db = getFirestore();
  const docRef = db
    .collection(COLLECTIONS.PETS)
    .doc(petId)
    .collection(SUBCOLLECTIONS.BREED_IDENTIFICATIONS)
    .doc();

  const record: Omit<AIBreedIdentificationRecord, 'id'> = {
    ...data,
    petId,
    imagePath,
    createdBy: userId,
    createdAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(record);
  const created = await docRef.get();
  return toBreedIdentificationResponse({
    id: created.id,
    ...created.data(),
  } as AIBreedIdentificationRecord);
}
