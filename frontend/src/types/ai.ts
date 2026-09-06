export type UrgencyLevel = "LOW" | "MODERATE" | "URGENT" | "EMERGENCY";

export interface AIHealthMessage {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: string;
  structuredResponse?: {
    summary: string;
    possibleConcerns: string[];
    recommendedActions: string[];
    warningSigns: string[];
    urgency: UrgencyLevel;
    vetCareRecommendation: string;
  };
}

export interface AIConversation {
  id: string;
  petId: string;
  petName: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messagesCount: number;
}

export interface DietPlan {
  id: string;
  petId: string;
  petName: string;
  createdAt: string;
  dailyCalories: number;
  feedingSchedule: {
    meal: string;
    time: string;
    portion: string;
    notes: string;
  }[];
  generalGuidelines: string[];
  foodsToAvoid: string[];
  hydrationGuidance: string;
  importantNotice: string;
}

export interface ExercisePlan {
  id: string;
  petId: string;
  petName: string;
  createdAt: string;
  targetDailyMinutes: number;
  dailySchedule: {
    activity: string;
    duration: string;
    intensity: "Low" | "Moderate" | "High";
    enrichmentType: string;
  }[];
  recommendedActivities: string[];
  restAndRecovery: string;
  safetyCaution: string;
}

export interface BreedIdentificationResult {
  estimatedBreed: string;
  confidence: number;
  imageUrl: string;
  characteristics: string[];
  temperament: string;
  alternativePossibilities: {
    breed: string;
    confidence: number;
  }[];
  disclaimer: string;
}

export interface VetFacility {
  id: string;
  name: string;
  type: "CLINIC" | "HOSPITAL" | "EMERGENCY";
  address: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  isOpenNow: boolean;
  is24x7Emergency: boolean;
  phone?: string;
  lat: number;
  lng: number;
}

export interface EmergencyEvent {
  id: string;
  petId: string;
  petName: string;
  description: string;
  status: "OPEN" | "RESOLVED" | "IN_CARE";
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  assignedFacility?: VetFacility;
}
