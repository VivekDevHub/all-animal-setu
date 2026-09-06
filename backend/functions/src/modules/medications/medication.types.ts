import { Timestamp } from 'firebase-admin/firestore';

export interface MedicationRecord {
  id?: string;
  petId: string;
  ownerId: string;
  medicineName: string;
  purpose: string;
  dosageText: string;
  frequency: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  prescribedBy: string;
  notes: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MedicationResponse {
  id: string;
  petId: string;
  ownerId: string;
  medicineName: string;
  purpose: string;
  dosageText: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  prescribedBy: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicationInput {
  medicineName: string;
  purpose?: string;
  dosageText?: string;
  frequency?: string;
  startDate: string;
  endDate?: string | null;
  prescribedBy?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateMedicationInput {
  medicineName?: string;
  purpose?: string;
  dosageText?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string | null;
  prescribedBy?: string;
  notes?: string;
  isActive?: boolean;
}
