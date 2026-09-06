import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '../../config/firebase';
import { COLLECTIONS, PAGINATION, SUBCOLLECTIONS } from '../../config/constants';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { assertActivePetOwner } from '../../shared/auth/authorization';
import { PaginatedResult } from '../../shared/types/user.types';
import { serializeTimestamps, toTimestamp } from '../../shared/utils/firestoreHelpers';
import { logger } from '../../shared/logger/logger';
import {
  cancelSourceReminder,
  computeVaccinationReminderDate,
  upsertSourceReminder,
} from '../reminders/reminder.service';
import {
  CreateVaccinationInput,
  UpdateVaccinationInput,
  VaccinationRecord,
  VaccinationResponse,
} from './vaccination.types';

function vaccinationsCollection(petId: string) {
  return getFirestore()
    .collection(COLLECTIONS.PETS)
    .doc(petId)
    .collection(SUBCOLLECTIONS.VACCINATIONS);
}

function toResponse(record: VaccinationRecord): VaccinationResponse {
  const serialized = serializeTimestamps(record as unknown as Record<string, unknown>, [
    'dateGiven',
    'nextDueDate',
    'createdAt',
    'updatedAt',
  ]);
  return { id: record.id!, ...serialized } as VaccinationResponse;
}

async function syncVaccinationReminder(
  record: VaccinationRecord,
  vaccinationId: string,
): Promise<void> {
  if (!record.nextDueDate) {
    await cancelSourceReminder('VACCINATION', vaccinationId);
    return;
  }

  const dueDate = record.nextDueDate.toDate();
  const reminderDate = computeVaccinationReminderDate(dueDate);
  await upsertSourceReminder({
    userId: record.ownerId,
    petId: record.petId,
    type: 'VACCINATION',
    sourceType: 'VACCINATION',
    sourceId: vaccinationId,
    title: `${record.vaccineName} vaccination due`,
    description: `Vaccination due on ${dueDate.toISOString().slice(0, 10)}`,
    scheduledAt: reminderDate,
  });
}

export async function createVaccination(
  petId: string,
  ownerId: string,
  input: CreateVaccinationInput,
): Promise<VaccinationResponse> {
  await assertActivePetOwner(petId, ownerId);
  const dateGiven = toTimestamp(input.dateGiven);
  if (!dateGiven) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid dateGiven');
  }

  const nextDueDate =
    input.nextDueDate === null || input.nextDueDate === undefined
      ? null
      : toTimestamp(input.nextDueDate);

  if (input.nextDueDate && !nextDueDate) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid nextDueDate');
  }

  const ref = vaccinationsCollection(petId).doc();
  await ref.set({
    petId,
    ownerId,
    vaccineName: input.vaccineName,
    dateGiven,
    nextDueDate,
    vetName: input.vetName ?? '',
    clinicName: input.clinicName ?? '',
    batchNumber: input.batchNumber ?? '',
    documentUrl: input.documentUrl ?? '',
    notes: input.notes ?? '',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const saved = await ref.get();
  const record = { id: saved.id, ...saved.data() } as VaccinationRecord;
  await syncVaccinationReminder(record, ref.id);
  logger.info('vaccination_created', { userId: ownerId, petId, vaccinationId: ref.id });
  return toResponse(record);
}

export async function listVaccinations(
  petId: string,
  ownerId: string,
  options: { pageSize?: number; cursor?: string },
): Promise<PaginatedResult<VaccinationResponse>> {
  await assertActivePetOwner(petId, ownerId);
  const pageSize = Math.min(options.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE);

  let query = vaccinationsCollection(petId).orderBy('dateGiven', 'desc').limit(pageSize + 1);

  if (options.cursor) {
    const cursorDoc = await vaccinationsCollection(petId).doc(options.cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();
  const docs = snapshot.docs.slice(0, pageSize);
  const hasMore = snapshot.docs.length > pageSize;

  return {
    items: docs.map((doc) => toResponse({ id: doc.id, ...doc.data() } as VaccinationRecord)),
    nextCursor: hasMore ? docs[docs.length - 1].id : null,
    hasMore,
  };
}

async function getVaccinationOrThrow(
  petId: string,
  vaccinationId: string,
  ownerId: string,
): Promise<VaccinationRecord> {
  await assertActivePetOwner(petId, ownerId);
  const doc = await vaccinationsCollection(petId).doc(vaccinationId).get();
  if (!doc.exists) {
    throw new AppError(ERROR_CODES.VACCINATION_NOT_FOUND, 'Vaccination not found');
  }
  const record = { id: doc.id, ...doc.data() } as VaccinationRecord;
  if (record.ownerId !== ownerId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'You are not authorized to access this vaccination.');
  }
  return record;
}

export async function getVaccination(
  petId: string,
  vaccinationId: string,
  ownerId: string,
): Promise<VaccinationResponse> {
  return toResponse(await getVaccinationOrThrow(petId, vaccinationId, ownerId));
}

export async function updateVaccination(
  petId: string,
  vaccinationId: string,
  ownerId: string,
  input: UpdateVaccinationInput,
): Promise<VaccinationResponse> {
  await getVaccinationOrThrow(petId, vaccinationId, ownerId);
  const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (input.vaccineName !== undefined) updates.vaccineName = input.vaccineName;
  if (input.vetName !== undefined) updates.vetName = input.vetName;
  if (input.clinicName !== undefined) updates.clinicName = input.clinicName;
  if (input.batchNumber !== undefined) updates.batchNumber = input.batchNumber;
  if (input.documentUrl !== undefined) updates.documentUrl = input.documentUrl;
  if (input.notes !== undefined) updates.notes = input.notes;

  if (input.dateGiven !== undefined) {
    const dateGiven = toTimestamp(input.dateGiven);
    if (!dateGiven) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid dateGiven');
    }
    updates.dateGiven = dateGiven;
  }

  if (input.nextDueDate !== undefined) {
    updates.nextDueDate =
      input.nextDueDate === null ? null : toTimestamp(input.nextDueDate);
    if (input.nextDueDate !== null && !updates.nextDueDate) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid nextDueDate');
    }
  }

  const ref = vaccinationsCollection(petId).doc(vaccinationId);
  await ref.update(updates);
  const saved = await ref.get();
  const record = { id: saved.id, ...saved.data() } as VaccinationRecord;
  await syncVaccinationReminder(record, vaccinationId);
  return toResponse(record);
}

export async function deleteVaccination(
  petId: string,
  vaccinationId: string,
  ownerId: string,
): Promise<void> {
  await getVaccinationOrThrow(petId, vaccinationId, ownerId);
  await vaccinationsCollection(petId).doc(vaccinationId).delete();
  await cancelSourceReminder('VACCINATION', vaccinationId);
}
