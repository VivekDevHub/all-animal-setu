import { Timestamp } from 'firebase-admin/firestore';

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface HealthPassportRecord {
  petId: string;
  ownerId: string;
  bloodType: string;
  allergies: string[];
  medicalConditions: string[];
  currentMedicationsSummary: string[];
  vaccinationSummary: string;
  emergencyContact: EmergencyContact;
  primaryVetId: string;
  notes: string;
  updatedAt: Timestamp;
}

export interface HealthPassportResponse {
  petId: string;
  ownerId: string;
  bloodType: string;
  allergies: string[];
  medicalConditions: string[];
  currentMedicationsSummary: string[];
  vaccinationSummary: string;
  emergencyContact: EmergencyContact;
  primaryVetId: string;
  notes: string;
  updatedAt: string;
}

export interface UpsertHealthPassportInput {
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  currentMedicationsSummary?: string[];
  vaccinationSummary?: string;
  emergencyContact?: EmergencyContact;
  primaryVetId?: string;
  notes?: string;
}
