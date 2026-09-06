import { EmergencyStatus, AIUrgencyLevel } from '../../config/constants';
import { NormalizedPlace } from '../vets/vet.types';

export interface CreateEmergencyInput {
  petId: string;
  latitude: number;
  longitude: number;
  description: string;
}

export interface UpdateEmergencyStatusInput {
  status: EmergencyStatus;
  resolutionNotes?: string;
}

export interface EmergencyRecord {
  id: string;
  userId: string;
  petId: string;
  latitude: number;
  longitude: number;
  description: string;
  urgency: AIUrgencyLevel;
  status: EmergencyStatus;
  resolutionNotes?: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface EmergencyResponse {
  emergencyId: string;
  userId: string;
  petId: string;
  urgency: AIUrgencyLevel;
  status: EmergencyStatus;
  message: string;
  description: string;
  latitude: number;
  longitude: number;
  nearbyFacilities: NormalizedPlace[];
  healthCardAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyCardResponse {
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
    gender: string;
    weight: number | null;
    weightUnit: string;
    bloodType?: string;
  };
  owner: {
    name: string;
    phone: string;
  };
  criticalInformation: {
    allergies: string[];
    medicalConditions: string[];
    medications: string[];
  };
  vaccinations: Array<{
    name: string;
    dateGiven: string | null;
    expiresAt: string | null;
  }>;
}
