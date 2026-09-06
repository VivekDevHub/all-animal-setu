import { Timestamp } from 'firebase-admin/firestore';
import { OcrStatus } from '../../config/constants';

export interface ExtractedOcrData {
  petName?: string;
  vaccineName?: string;
  dateGiven?: string;
  nextDueDate?: string;
  vetName?: string;
  clinicName?: string;
  diagnosis?: string;
  medicineName?: string;
  status: 'DRAFT';
}

export interface DocumentRecord {
  id?: string;
  ownerId: string;
  petId: string;
  recordId: string;
  fileName: string;
  contentType: string;
  size: number;
  storagePath: string;
  documentType: string;
  ocrStatus: OcrStatus | string;
  rawText: string;
  extractedData: ExtractedOcrData | null;
  requiresConfirmation: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DocumentResponse {
  id: string;
  ownerId: string;
  petId: string;
  recordId: string;
  fileName: string;
  contentType: string;
  size: number;
  storagePath: string;
  documentType: string;
  ocrStatus: string;
  rawText: string;
  extractedData: ExtractedOcrData | null;
  requiresConfirmation: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmOcrInput {
  vaccineName?: string;
  dateGiven?: string;
  nextDueDate?: string | null;
  vetName?: string;
  clinicName?: string;
  saveAsVaccination?: boolean;
}
