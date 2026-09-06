import { Timestamp } from 'firebase-admin/firestore';

export interface VaccinationRecord {
  id?: string;
  petId: string;
  ownerId: string;
  vaccineName: string;
  dateGiven: Timestamp;
  nextDueDate: Timestamp | null;
  vetName: string;
  clinicName: string;
  batchNumber: string;
  documentUrl: string;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VaccinationResponse {
  id: string;
  petId: string;
  ownerId: string;
  vaccineName: string;
  dateGiven: string;
  nextDueDate: string | null;
  vetName: string;
  clinicName: string;
  batchNumber: string;
  documentUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaccinationInput {
  vaccineName: string;
  dateGiven: string;
  nextDueDate?: string | null;
  vetName?: string;
  clinicName?: string;
  batchNumber?: string;
  documentUrl?: string;
  notes?: string;
}

export interface UpdateVaccinationInput {
  vaccineName?: string;
  dateGiven?: string;
  nextDueDate?: string | null;
  vetName?: string;
  clinicName?: string;
  batchNumber?: string;
  documentUrl?: string;
  notes?: string;
}
