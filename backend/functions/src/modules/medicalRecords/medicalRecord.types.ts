import { Timestamp } from 'firebase-admin/firestore';
import { MedicalRecordType } from '../../config/constants';

export interface MedicalRecord {
  id?: string;
  petId: string;
  ownerId: string;
  title: string;
  type: MedicalRecordType | string;
  description: string;
  diagnosis: string;
  doctorName: string;
  clinicName: string;
  visitDate: Timestamp;
  attachments: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MedicalRecordResponse {
  id: string;
  petId: string;
  ownerId: string;
  title: string;
  type: string;
  description: string;
  diagnosis: string;
  doctorName: string;
  clinicName: string;
  visitDate: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordInput {
  title: string;
  type: string;
  description?: string;
  diagnosis?: string;
  doctorName?: string;
  clinicName?: string;
  visitDate: string;
  attachments?: string[];
}

export interface UpdateMedicalRecordInput {
  title?: string;
  type?: string;
  description?: string;
  diagnosis?: string;
  doctorName?: string;
  clinicName?: string;
  visitDate?: string;
  attachments?: string[];
}
