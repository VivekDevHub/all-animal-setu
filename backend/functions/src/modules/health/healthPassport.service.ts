import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirestore } from '../../config/firebase';
import {
  COLLECTIONS,
  HEALTH_PASSPORT_DOC_ID,
  SUBCOLLECTIONS,
} from '../../config/constants';
import { assertActivePetOwner } from '../../shared/auth/authorization';
import { serializeTimestamps } from '../../shared/utils/firestoreHelpers';
import {
  HealthPassportRecord,
  HealthPassportResponse,
  UpsertHealthPassportInput,
} from './healthPassport.types';

function toResponse(data: HealthPassportRecord): HealthPassportResponse {
  const serialized = serializeTimestamps(data as unknown as Record<string, unknown>, ['updatedAt']);
  return serialized as unknown as HealthPassportResponse;
}

function defaultPassport(petId: string, ownerId: string): HealthPassportRecord {
  return {
    petId,
    ownerId,
    bloodType: '',
    allergies: [],
    medicalConditions: [],
    currentMedicationsSummary: [],
    vaccinationSummary: '',
    emergencyContact: { name: '', phone: '' },
    primaryVetId: '',
    notes: '',
    updatedAt: Timestamp.now(),
  };
}

function passportRef(petId: string) {
  return getFirestore()
    .collection(COLLECTIONS.PETS)
    .doc(petId)
    .collection(SUBCOLLECTIONS.HEALTH_PASSPORT)
    .doc(HEALTH_PASSPORT_DOC_ID);
}

export async function getHealthPassport(
  petId: string,
  ownerId: string,
): Promise<HealthPassportResponse> {
  await assertActivePetOwner(petId, ownerId);
  const doc = await passportRef(petId).get();

  if (!doc.exists) {
    return toResponse(defaultPassport(petId, ownerId));
  }

  return toResponse(doc.data() as HealthPassportRecord);
}

export async function upsertHealthPassport(
  petId: string,
  ownerId: string,
  input: UpsertHealthPassportInput,
): Promise<HealthPassportResponse> {
  await assertActivePetOwner(petId, ownerId);
  const ref = passportRef(petId);
  const existing = await ref.get();
  const base = existing.exists
    ? (existing.data() as HealthPassportRecord)
    : defaultPassport(petId, ownerId);

  const updated = {
    ...base,
    petId,
    ownerId,
    bloodType: input.bloodType ?? base.bloodType,
    allergies: input.allergies ?? base.allergies,
    medicalConditions: input.medicalConditions ?? base.medicalConditions,
    currentMedicationsSummary:
      input.currentMedicationsSummary ?? base.currentMedicationsSummary,
    vaccinationSummary: input.vaccinationSummary ?? base.vaccinationSummary,
    emergencyContact: input.emergencyContact ?? base.emergencyContact,
    primaryVetId: input.primaryVetId ?? base.primaryVetId,
    notes: input.notes ?? base.notes,
  };

  await ref.set(
    {
      ...updated,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  const saved = await ref.get();
  return toResponse(saved.data() as HealthPassportRecord);
}
