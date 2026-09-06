import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { EmergencyRecord, UpdateEmergencyStatusInput } from '../modules/emergency/emergency.types';

export async function findEmergencyById(emergencyId: string): Promise<EmergencyRecord | null> {
  const doc = await getFirestore().collection(COLLECTIONS.EMERGENCIES).doc(emergencyId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() } as EmergencyRecord;
}

export async function createEmergencyRecord(
  data: Omit<EmergencyRecord, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<EmergencyRecord> {
  const db = getFirestore();
  const docRef = db.collection(COLLECTIONS.EMERGENCIES).doc();
  const now = FieldValue.serverTimestamp();

  const record = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(record);
  const created = await docRef.get();
  return { id: created.id, ...created.data() } as EmergencyRecord;
}

export async function listEmergenciesForUser(
  userId: string,
  limitCount = 20,
): Promise<EmergencyRecord[]> {
  const snapshot = await getFirestore()
    .collection(COLLECTIONS.EMERGENCIES)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as EmergencyRecord);
}

export async function updateEmergencyRecordStatus(
  emergencyId: string,
  input: UpdateEmergencyStatusInput,
): Promise<EmergencyRecord | null> {
  const docRef = getFirestore().collection(COLLECTIONS.EMERGENCIES).doc(emergencyId);
  const existing = await docRef.get();

  if (!existing.exists) {
    return null;
  }

  const updates: Record<string, unknown> = {
    status: input.status,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (input.resolutionNotes !== undefined) {
    updates.resolutionNotes = input.resolutionNotes;
  }

  await docRef.update(updates);
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() } as EmergencyRecord;
}
