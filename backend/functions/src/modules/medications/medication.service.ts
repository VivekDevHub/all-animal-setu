import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '../../config/firebase';
import { COLLECTIONS, PAGINATION, SUBCOLLECTIONS } from '../../config/constants';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { assertActivePetOwner } from '../../shared/auth/authorization';
import { PaginatedResult } from '../../shared/types/user.types';
import { serializeTimestamps, toTimestamp } from '../../shared/utils/firestoreHelpers';
import { logger } from '../../shared/logger/logger';
import { cancelSourceReminder, upsertSourceReminder } from '../reminders/reminder.service';
import {
  CreateMedicationInput,
  MedicationRecord,
  MedicationResponse,
  UpdateMedicationInput,
} from './medication.types';

function medicationsCollection(petId: string) {
  return getFirestore()
    .collection(COLLECTIONS.PETS)
    .doc(petId)
    .collection(SUBCOLLECTIONS.MEDICATIONS);
}

function toResponse(record: MedicationRecord): MedicationResponse {
  const serialized = serializeTimestamps(record as unknown as Record<string, unknown>, [
    'startDate',
    'endDate',
    'createdAt',
    'updatedAt',
  ]);
  return { id: record.id!, ...serialized } as MedicationResponse;
}

async function syncMedicationReminder(record: MedicationRecord, medicationId: string): Promise<void> {
  if (!record.isActive || !record.frequency || record.frequency === 'CUSTOM') {
    await cancelSourceReminder('MEDICATION', medicationId);
    return;
  }

  const scheduledAt = record.startDate.toDate();
  await upsertSourceReminder({
    userId: record.ownerId,
    petId: record.petId,
    type: 'MEDICATION',
    sourceType: 'MEDICATION',
    sourceId: medicationId,
    title: `Medicine reminder: ${record.medicineName}`,
    description: record.dosageText || record.purpose,
    scheduledAt,
  });
}

export async function createMedication(
  petId: string,
  ownerId: string,
  input: CreateMedicationInput,
): Promise<MedicationResponse> {
  await assertActivePetOwner(petId, ownerId);
  const startDate = toTimestamp(input.startDate);
  if (!startDate) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid startDate');
  }

  const endDate =
    input.endDate === null || input.endDate === undefined ? null : toTimestamp(input.endDate);
  if (input.endDate && !endDate) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid endDate');
  }

  const ref = medicationsCollection(petId).doc();
  await ref.set({
    petId,
    ownerId,
    medicineName: input.medicineName,
    purpose: input.purpose ?? '',
    dosageText: input.dosageText ?? '',
    frequency: input.frequency ?? 'DAILY',
    startDate,
    endDate,
    prescribedBy: input.prescribedBy ?? '',
    notes: input.notes ?? '',
    isActive: input.isActive ?? true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const saved = await ref.get();
  const record = { id: saved.id, ...saved.data() } as MedicationRecord;
  await syncMedicationReminder(record, ref.id);
  logger.info('medication_created', { userId: ownerId, petId, medicationId: ref.id });
  return toResponse(record);
}

export async function listMedications(
  petId: string,
  ownerId: string,
  options: { pageSize?: number; cursor?: string },
): Promise<PaginatedResult<MedicationResponse>> {
  await assertActivePetOwner(petId, ownerId);
  const pageSize = Math.min(options.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE);

  let query = medicationsCollection(petId).orderBy('createdAt', 'desc').limit(pageSize + 1);

  if (options.cursor) {
    const cursorDoc = await medicationsCollection(petId).doc(options.cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();
  const docs = snapshot.docs.slice(0, pageSize);
  const hasMore = snapshot.docs.length > pageSize;

  return {
    items: docs.map((doc) => toResponse({ id: doc.id, ...doc.data() } as MedicationRecord)),
    nextCursor: hasMore ? docs[docs.length - 1].id : null,
    hasMore,
  };
}

async function getMedicationOrThrow(
  petId: string,
  medicationId: string,
  ownerId: string,
): Promise<MedicationRecord> {
  await assertActivePetOwner(petId, ownerId);
  const doc = await medicationsCollection(petId).doc(medicationId).get();
  if (!doc.exists) {
    throw new AppError(ERROR_CODES.MEDICATION_NOT_FOUND, 'Medication not found');
  }
  const record = { id: doc.id, ...doc.data() } as MedicationRecord;
  if (record.ownerId !== ownerId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'You are not authorized to access this medication.');
  }
  return record;
}

export async function getMedication(
  petId: string,
  medicationId: string,
  ownerId: string,
): Promise<MedicationResponse> {
  return toResponse(await getMedicationOrThrow(petId, medicationId, ownerId));
}

export async function updateMedication(
  petId: string,
  medicationId: string,
  ownerId: string,
  input: UpdateMedicationInput,
): Promise<MedicationResponse> {
  await getMedicationOrThrow(petId, medicationId, ownerId);
  const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (input.medicineName !== undefined) updates.medicineName = input.medicineName;
  if (input.purpose !== undefined) updates.purpose = input.purpose;
  if (input.dosageText !== undefined) updates.dosageText = input.dosageText;
  if (input.frequency !== undefined) updates.frequency = input.frequency;
  if (input.prescribedBy !== undefined) updates.prescribedBy = input.prescribedBy;
  if (input.notes !== undefined) updates.notes = input.notes;
  if (input.isActive !== undefined) updates.isActive = input.isActive;

  if (input.startDate !== undefined) {
    const startDate = toTimestamp(input.startDate);
    if (!startDate) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid startDate');
    }
    updates.startDate = startDate;
  }

  if (input.endDate !== undefined) {
    updates.endDate = input.endDate === null ? null : toTimestamp(input.endDate);
    if (input.endDate !== null && !updates.endDate) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid endDate');
    }
  }

  const ref = medicationsCollection(petId).doc(medicationId);
  await ref.update(updates);
  const saved = await ref.get();
  const record = { id: saved.id, ...saved.data() } as MedicationRecord;
  await syncMedicationReminder(record, medicationId);
  return toResponse(record);
}

export async function deleteMedication(
  petId: string,
  medicationId: string,
  ownerId: string,
): Promise<void> {
  await getMedicationOrThrow(petId, medicationId, ownerId);
  await medicationsCollection(petId).doc(medicationId).update({
    isActive: false,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await cancelSourceReminder('MEDICATION', medicationId);
}
