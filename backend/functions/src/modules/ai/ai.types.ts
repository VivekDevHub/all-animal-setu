import { AIUrgencyLevel } from '../../config/constants';

export interface AIHealthAssistantInput {
  petId: string;
  message: string;
  conversationId?: string;
}

export interface AIHealthResponsePayload {
  urgency: AIUrgencyLevel;
  summary: string;
  possibleConcerns: string[];
  recommendedActions: string[];
  warningSigns: string[];
  recommendedProfessionalCare: boolean;
  shouldFindNearbyVet: boolean;
  disclaimer: string;
}

export interface AIHealthAssistantResponse extends AIHealthResponsePayload {
  conversationId: string;
  messageId: string;
  petId: string;
  createdAt: string;
}

export interface AIConversationRecord {
  id: string;
  userId: string;
  petId: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: unknown;
  updatedAt: unknown;
}

export interface AIConversationMessageRecord {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  urgency?: AIUrgencyLevel;
  structuredResponse?: AIHealthResponsePayload;
  createdAt: unknown;
}

export interface AIConversationResponse {
  id: string;
  userId: string;
  petId: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  messages?: AIConversationMessageResponse[];
}

export interface AIConversationMessageResponse {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  urgency?: AIUrgencyLevel;
  structuredResponse?: AIHealthResponsePayload;
  createdAt: string;
}

export interface FeedingScheduleItem {
  timeOfDay: string;
  portion: string;
  notes?: string;
}

export interface AIDietPlanPayload {
  summary: string;
  feedingSchedule: FeedingScheduleItem[];
  generalFoodGuidelines: string[];
  foodsToAvoid: string[];
  hydrationTips: string[];
  professionalReviewRecommended: boolean;
}

export interface AIDietPlanRecord extends AIDietPlanPayload {
  id?: string;
  petId: string;
  createdBy: string;
  model: string;
  version: number;
  createdAt: unknown;
}

export interface AIDietPlanResponse extends AIDietPlanPayload {
  id: string;
  petId: string;
  createdBy: string;
  model: string;
  version: number;
  createdAt: string;
}

export interface ExerciseRecommendationItem {
  activity: string;
  durationMinutes: number;
  intensity: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface AIExercisePlanPayload {
  summary: string;
  dailyActivityRecommendations: ExerciseRecommendationItem[];
  weeklyFrequency: string;
  enrichmentActivities: string[];
  restGuidance: string[];
  precautions: string[];
  professionalReviewRecommended: boolean;
}

export interface AIExercisePlanRecord extends AIExercisePlanPayload {
  id?: string;
  petId: string;
  createdBy: string;
  model: string;
  version: number;
  createdAt: unknown;
}

export interface AIExercisePlanResponse extends AIExercisePlanPayload {
  id: string;
  petId: string;
  createdBy: string;
  model: string;
  version: number;
  createdAt: string;
}

export interface AIBreedIdentificationPayload {
  species: string;
  primaryBreed: string;
  alternativeBreeds: string[];
  confidence: number;
  notes: string;
  disclaimer: string;
}

export interface AIBreedIdentificationRecord extends AIBreedIdentificationPayload {
  id?: string;
  petId: string;
  imagePath: string;
  createdBy: string;
  createdAt: unknown;
}

export interface AIBreedIdentificationResponse extends AIBreedIdentificationPayload {
  id: string;
  petId: string;
  imagePath: string;
  createdBy: string;
  createdAt: string;
}
