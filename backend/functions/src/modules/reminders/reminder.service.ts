import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { subDays } from 'date-fns';
import { getFirestore } from '../../config/firebase';
import {
  COLLECTIONS,
  DEFAULT_VACCINATION_REMINDER_DAYS_BEFORE,
  PAGINATION,
} from '../../config/constants';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { assertActivePetOwner } from '../../shared/auth/authorization';
import { PaginatedResult } from '../../shared/types/user.types';
import { serializeTimestamps, toTimestamp } from '../../shared/utils/firestoreHelpers';
import { logger } from '../../shared/logger/logger';
import {
  CreateReminderInput,
  ReminderRecord,
  ReminderResponse,
  UpdateReminderInput,
  UpsertSourceReminderInput,
} from './reminder.types';
import { buildSourceReminderId } from './reminder.schema';

function toResponse(record: ReminderRecord): ReminderResponse {
  const serialized = serializeTimestamps(record as unknown as Record<string, unknown>, [
    'scheduledAt',
    'createdAt',
    'updatedAt',
  ]);
  return { id: record.id!, ...serialized } as ReminderResponse;
}

export async function upsertSourceReminder(input: UpsertSourceReminderInput): Promise<void> {
  const reminderId = buildSourceReminderId(input.sourceType, input.sourceId);
  const ref = getFirestore().collection(COLLECTIONS.REMINDERS).doc(reminderId);

  await ref.set(
    {
      userId: input.userId,
      petId: input.petId,
      type: input.type,
      title: input.title,
      description: input.description ?? '',
      scheduledAt: Timestamp.fromDate(input.scheduledAt),
      status: 'PENDING',
      notificationSent: false,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  logger.info('reminder_created', {
    userId: input.userId,
    petId: input.petId,
    reminderId,
    sourceType: input.sourceType,
  });
}

export async function cancelSourceReminder(sourceType: string, sourceId: string): Promise<void> {
  const reminderId = buildSourceReminderId(sourceType, sourceId);
  const ref = getFirestore().collection(COLLECTIONS.REMINDERS).doc(reminderId);
  const doc = await ref.get();
  if (!doc.exists) {
    return;
  }
  await ref.update({
    status: 'CANCELLED',
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export function computeVaccinationReminderDate(nextDueDate: Date): Date {
  return subDays(nextDueDate, DEFAULT_VACCINATION_REMINDER_DAYS_BEFORE);
}

export async function createReminder(
  userId: string,
  input: CreateReminderInput,
): Promise<ReminderResponse> {
  await assertActivePetOwner(input.petId, userId);
  const scheduledAt = toTimestamp(input.scheduledAt);
  if (!scheduledAt) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid scheduledAt');
  }

  const ref = getFirestore().collection(COLLECTIONS.REMINDERS).doc();
  await ref.set({
    userId,
    petId: input.petId,
    type: input.type,
    title: input.title,
    description: input.description ?? '',
    scheduledAt,
    status: 'PENDING',
    notificationSent: false,
    sourceType: 'CUSTOM',
    sourceId: ref.id,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const saved = await ref.get();
  logger.info('reminder_created', { userId, petId: input.petId, reminderId: ref.id });
  return toResponse({ id: saved.id, ...saved.data() } as ReminderRecord);
}

export async function listReminders(
  userId: string,
  options: { pageSize?: number; cursor?: string; petId?: string },
): Promise<PaginatedResult<ReminderResponse>> {
  const pageSize = Math.min(options.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE);

  let query: FirebaseFirestore.Query = getFirestore()
    .collection(COLLECTIONS.REMINDERS)
    .where('userId', '==', userId)
    .orderBy('scheduledAt', 'asc')
    .limit(pageSize + 1);

  if (options.petId) {
    query = getFirestore()
      .collection(COLLECTIONS.REMINDERS)
      .where('userId', '==', userId)
      .where('petId', '==', options.petId)
      .orderBy('scheduledAt', 'asc')
      .limit(pageSize + 1);
  }

  if (options.cursor) {
    const cursorDoc = await getFirestore().collection(COLLECTIONS.REMINDERS).doc(options.cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();
  const docs = snapshot.docs.slice(0, pageSize);
  const hasMore = snapshot.docs.length > pageSize;

  return {
    items: docs.map((doc) => toResponse({ id: doc.id, ...doc.data() } as ReminderRecord)),
    nextCursor: hasMore ? docs[docs.length - 1].id : null,
    hasMore,
  };
}

async function getReminderOrThrow(reminderId: string, userId: string): Promise<ReminderRecord> {
  const doc = await getFirestore().collection(COLLECTIONS.REMINDERS).doc(reminderId).get();
  if (!doc.exists) {
    throw new AppError(ERROR_CODES.REMINDER_NOT_FOUND, 'Reminder not found');
  }
  const record = { id: doc.id, ...doc.data() } as ReminderRecord;
  if (record.userId !== userId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'You are not authorized to access this reminder.');
  }
  return record;
}

export async function getReminder(reminderId: string, userId: string): Promise<ReminderResponse> {
  const record = await getReminderOrThrow(reminderId, userId);
  return toResponse(record);
}

export async function updateReminder(
  reminderId: string,
  userId: string,
  input: UpdateReminderInput,
): Promise<ReminderResponse> {
  await getReminderOrThrow(reminderId, userId);
  const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.status !== undefined) updates.status = input.status;
  if (input.scheduledAt !== undefined) {
    const scheduledAt = toTimestamp(input.scheduledAt);
    if (!scheduledAt) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid scheduledAt');
    }
    updates.scheduledAt = scheduledAt;
    updates.notificationSent = false;
    updates.status = 'PENDING';
  }

  const ref = getFirestore().collection(COLLECTIONS.REMINDERS).doc(reminderId);
  await ref.update(updates);
  const saved = await ref.get();
  return toResponse({ id: saved.id, ...saved.data() } as ReminderRecord);
}

export async function deleteReminder(reminderId: string, userId: string): Promise<void> {
  await getReminderOrThrow(reminderId, userId);
  await getFirestore().collection(COLLECTIONS.REMINDERS).doc(reminderId).update({
    status: 'CANCELLED',
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function processDueReminders(now: Date = new Date()): Promise<number> {
  const snapshot = await getFirestore()
    .collection(COLLECTIONS.REMINDERS)
    .where('status', '==', 'PENDING')
    .where('notificationSent', '==', false)
    .where('scheduledAt', '<=', Timestamp.fromDate(now))
    .limit(100)
    .get();

  let processed = 0;
  for (const doc of snapshot.docs) {
    await doc.ref.update({
      notificationSent: true,
      status: 'SENT',
      updatedAt: FieldValue.serverTimestamp(),
    });
    processed += 1;
    logger.info('reminder_sent', { reminderId: doc.id, userId: doc.data().userId });
  }

  return processed;
}
