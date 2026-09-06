import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '../../config/firebase';
import { COLLECTIONS, PAGINATION, SUBCOLLECTIONS } from '../../config/constants';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { assertActivePetOwner } from '../../shared/auth/authorization';
import { PaginatedResult } from '../../shared/types/user.types';
import { serializeTimestamps, toTimestamp } from '../../shared/utils/firestoreHelpers';
import { logger } from '../../shared/logger/logger';
import {
  CreateMedicalRecordInput,
  MedicalRecord,
  MedicalRecordResponse,
  UpdateMedicalRecordInput,
} from './medicalRecord.types';

function recordsCollection(petId: string) {
  return getFirestore()
    .collection(COLLECTIONS.PETS)
    .doc(petId)
    .collection(SUBCOLLECTIONS.MEDICAL_RECORDS);
}

function toResponse(record: MedicalRecord): MedicalRecordResponse {
  const serialized = serializeTimestamps(record as unknown as Record<string, unknown>, [
    'visitDate',
    'createdAt',
    'updatedAt',
  ]);
  return { id: record.id!, ...serialized } as MedicalRecordResponse;
}

export async function createMedicalRecord(
  petId: string,
  ownerId: string,
  input: CreateMedicalRecordInput,
): Promise<MedicalRecordResponse> {
  await assertActivePetOwner(petId, ownerId);
  const ref = recordsCollection(petId).doc();
  const visitDate = toTimestamp(input.visitDate);
  if (!visitDate) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid visitDate');
  }

  const data = {
    petId,
    ownerId,
    title: input.title,
    type: input.type,
    description: input.description ?? '',
    diagnosis: input.diagnosis ?? '',
    doctorName: input.doctorName ?? '',
    clinicName: input.clinicName ?? '',
    visitDate,
    attachments: input.attachments ?? [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await ref.set(data);
  const saved = await ref.get();
  logger.info('medical_record_created', { userId: ownerId, petId, recordId: ref.id });
  return toResponse({ id: saved.id, ...saved.data() } as MedicalRecord);
}

export async function listMedicalRecords(
  petId: string,
  ownerId: string,
  options: { pageSize?: number; cursor?: string },
): Promise<PaginatedResult<MedicalRecordResponse>> {
  await assertActivePetOwner(petId, ownerId);
  const pageSize = Math.min(options.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE);

  let query = recordsCollection(petId)
    .orderBy('visitDate', 'desc')
    .limit(pageSize + 1);

  if (options.cursor) {
    const cursorDoc = await recordsCollection(petId).doc(options.cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();
  const docs = snapshot.docs.slice(0, pageSize);
  const hasMore = snapshot.docs.length > pageSize;

  return {
    items: docs.map((doc) => toResponse({ id: doc.id, ...doc.data() } as MedicalRecord)),
    nextCursor: hasMore ? docs[docs.length - 1].id : null,
    hasMore,
  };
}

async function getRecordOrThrow(petId: string, recordId: string, ownerId: string): Promise<MedicalRecord> {
  await assertActivePetOwner(petId, ownerId);
  const doc = await recordsCollection(petId).doc(recordId).get();
  if (!doc.exists) {
    throw new AppError(ERROR_CODES.MEDICAL_RECORD_NOT_FOUND, 'Medical record not found');
  }
  const record = { id: doc.id, ...doc.data() } as MedicalRecord;
  if (record.ownerId !== ownerId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'You are not authorized to access this medical record.');
  }
  return record;
}

export async function getMedicalRecord(
  petId: string,
  recordId: string,
  ownerId: string,
): Promise<MedicalRecordResponse> {
  const record = await getRecordOrThrow(petId, recordId, ownerId);
  return toResponse(record);
}

export async function updateMedicalRecord(
  petId: string,
  recordId: string,
  ownerId: string,
  input: UpdateMedicalRecordInput,
): Promise<MedicalRecordResponse> {
  await getRecordOrThrow(petId, recordId, ownerId);
  const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (input.title !== undefined) updates.title = input.title;
  if (input.type !== undefined) updates.type = input.type;
  if (input.description !== undefined) updates.description = input.description;
  if (input.diagnosis !== undefined) updates.diagnosis = input.diagnosis;
  if (input.doctorName !== undefined) updates.doctorName = input.doctorName;
  if (input.clinicName !== undefined) updates.clinicName = input.clinicName;
  if (input.attachments !== undefined) updates.attachments = input.attachments;
  if (input.visitDate !== undefined) {
    const visitDate = toTimestamp(input.visitDate);
    if (!visitDate) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid visitDate');
    }
    updates.visitDate = visitDate;
  }

  const ref = recordsCollection(petId).doc(recordId);
  await ref.update(updates);
  const saved = await ref.get();
  return toResponse({ id: saved.id, ...saved.data() } as MedicalRecord);
}

export async function deleteMedicalRecord(
  petId: string,
  recordId: string,
  ownerId: string,
): Promise<void> {
  await getRecordOrThrow(petId, recordId, ownerId);
  await recordsCollection(petId).doc(recordId).delete();
}

export async function appendAttachmentToRecord(
  petId: string,
  recordId: string,
  ownerId: string,
  storagePath: string,
): Promise<void> {
  const record = await getRecordOrThrow(petId, recordId, ownerId);
  const attachments = [...record.attachments, storagePath];
  await recordsCollection(petId).doc(recordId).update({
    attachments,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
