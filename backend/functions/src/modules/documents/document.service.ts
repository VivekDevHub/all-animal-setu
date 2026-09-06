import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore, getStorageBucket } from '../../config/firebase';
import { COLLECTIONS, FILE_LIMITS } from '../../config/constants';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { assertActivePetOwner } from '../../shared/auth/authorization';
import { serializeTimestamps } from '../../shared/utils/firestoreHelpers';
import { extensionForMimeType, validateUploadedFile } from '../../shared/utils/fileValidation';
import { logger } from '../../shared/logger/logger';
import { appendAttachmentToRecord } from '../medicalRecords/medicalRecord.service';
import { createVaccination } from '../vaccinations/vaccination.service';
import { runOcrSafely } from './ocr.service';
import {
  ConfirmOcrInput,
  DocumentRecord,
  DocumentResponse,
  ExtractedOcrData,
} from './document.types';

function toResponse(record: DocumentRecord): DocumentResponse {
  const serialized = serializeTimestamps(record as unknown as Record<string, unknown>, [
    'createdAt',
    'updatedAt',
  ]);
  return { id: record.id!, ...serialized } as DocumentResponse;
}

export async function uploadDocument(
  ownerId: string,
  file: Express.Multer.File,
  input: {
    petId: string;
    recordId?: string;
    documentType: string;
    runOcr?: boolean;
  },
): Promise<DocumentResponse> {
  await assertActivePetOwner(input.petId, ownerId);
  validateUploadedFile(file, {
    maxSizeBytes: FILE_LIMITS.MAX_SIZE_BYTES,
    allowedMimeTypes: FILE_LIMITS.ALLOWED_MIME_TYPES,
  });

  const docRef = getFirestore().collection(COLLECTIONS.DOCUMENTS).doc();
  const extension = extensionForMimeType(file.mimetype);
  const storagePath = input.recordId
    ? `users/${ownerId}/pets/${input.petId}/medical-records/${input.recordId}/${docRef.id}.${extension}`
    : `users/${ownerId}/pets/${input.petId}/documents/${docRef.id}.${extension}`;

  await getStorageBucket()
    .file(storagePath)
    .save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          ownerId,
          petId: input.petId,
          documentId: docRef.id,
        },
      },
    });

  const data = {
    ownerId,
    petId: input.petId,
    recordId: input.recordId ?? '',
    fileName: file.originalname,
    contentType: file.mimetype,
    size: file.size,
    storagePath,
    documentType: input.documentType,
    ocrStatus: input.runOcr ? 'PENDING' : 'CONFIRMED',
    rawText: '',
    extractedData: null,
    requiresConfirmation: Boolean(input.runOcr),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(data);

  if (input.recordId) {
    await appendAttachmentToRecord(input.petId, input.recordId, ownerId, storagePath);
  }

  logger.info('document_uploaded', { userId: ownerId, petId: input.petId, documentId: docRef.id });

  if (input.runOcr) {
    void processDocumentOcr(docRef.id).catch(() => undefined);
  }

  const saved = await docRef.get();
  return toResponse({ id: saved.id, ...saved.data() } as DocumentRecord);
}

export async function getDocument(documentId: string, ownerId: string): Promise<DocumentResponse> {
  const doc = await getFirestore().collection(COLLECTIONS.DOCUMENTS).doc(documentId).get();
  if (!doc.exists) {
    throw new AppError(ERROR_CODES.DOCUMENT_NOT_FOUND, 'Document not found');
  }

  const record = { id: doc.id, ...doc.data() } as DocumentRecord;
  if (record.ownerId !== ownerId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'You are not authorized to access this document.');
  }

  return toResponse(record);
}

export async function processDocumentOcr(documentId: string): Promise<DocumentResponse> {
  const ref = getFirestore().collection(COLLECTIONS.DOCUMENTS).doc(documentId);
  const doc = await ref.get();
  if (!doc.exists) {
    throw new AppError(ERROR_CODES.DOCUMENT_NOT_FOUND, 'Document not found');
  }

  const record = { id: doc.id, ...doc.data() } as DocumentRecord;
  await ref.update({ ocrStatus: 'PROCESSING', updatedAt: FieldValue.serverTimestamp() });

  const { rawText, extractedData } = await runOcrSafely(record.storagePath);
  const hasData = Object.keys(extractedData).length > 0;

  const payload: ExtractedOcrData | null = hasData
    ? {
        ...extractedData,
        status: 'DRAFT',
      }
    : null;

  await ref.update({
    ocrStatus: hasData ? 'COMPLETED' : 'FAILED',
    rawText: rawText.slice(0, 10000),
    extractedData: payload,
    requiresConfirmation: hasData,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const saved = await ref.get();
  return toResponse({ id: saved.id, ...saved.data() } as DocumentRecord);
}

export async function confirmDocumentOcr(
  documentId: string,
  ownerId: string,
  input: ConfirmOcrInput,
): Promise<{ document: DocumentResponse; vaccinationId?: string }> {
  const document = await getDocument(documentId, ownerId);

  if (document.ocrStatus !== 'COMPLETED' && document.ocrStatus !== 'FAILED') {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Document OCR is not ready for confirmation');
  }

  let vaccinationId: string | undefined;
  if (input.saveAsVaccination && input.vaccineName && input.dateGiven) {
    const vaccination = await createVaccination(document.petId, ownerId, {
      vaccineName: input.vaccineName,
      dateGiven: input.dateGiven,
      nextDueDate: input.nextDueDate ?? null,
      vetName: input.vetName,
      clinicName: input.clinicName,
      documentUrl: document.storagePath,
    });
    vaccinationId = vaccination.id;
  }

  const ref = getFirestore().collection(COLLECTIONS.DOCUMENTS).doc(documentId);
  await ref.update({
    ocrStatus: 'CONFIRMED',
    requiresConfirmation: false,
    extractedData: {
      ...(document.extractedData ?? {}),
      ...input,
      status: 'DRAFT',
    },
    updatedAt: FieldValue.serverTimestamp(),
  });

  const saved = await ref.get();
  return {
    document: toResponse({ id: saved.id, ...saved.data() } as DocumentRecord),
    vaccinationId,
  };
}

export async function triggerDocumentOcr(documentId: string, ownerId: string): Promise<DocumentResponse> {
  await getDocument(documentId, ownerId);
  return processDocumentOcr(documentId);
}
