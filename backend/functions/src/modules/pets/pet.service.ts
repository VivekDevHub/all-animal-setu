import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirestore, getStorageBucket } from '../../config/firebase';
import { COLLECTIONS, PAGINATION } from '../../config/constants';
import { PaginatedResult } from '../../shared/types/user.types';
import { parseDateInput, timestampToIso } from '../../shared/utils/serialize';
import { extensionForMimeType } from '../../shared/utils/fileValidation';
import { assertActivePetOwner, assertPetOwner } from '../../shared/auth/authorization';
import { logger } from '../../shared/logger/logger';
import {
  CreatePetInput,
  PetRecord,
  PetResponse,
  UpdatePetInput,
} from './pet.types';

const SIGNED_URL_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function toPetResponse(pet: PetRecord, photoUrl: string | null = null): PetResponse {
  return {
    id: pet.id!,
    ownerId: pet.ownerId,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    dateOfBirth: timestampToIso(pet.dateOfBirth),
    weight: pet.weight,
    weightUnit: pet.weightUnit,
    photoUrl,
    microchipId: pet.microchipId,
    allergies: pet.allergies,
    medicalConditions: pet.medicalConditions,
    bloodType: pet.bloodType,
    isActive: pet.isActive,
    createdAt: timestampToIso(pet.createdAt)!,
    updatedAt: timestampToIso(pet.updatedAt)!,
  };
}

async function resolvePhotoUrl(storagePath: string | undefined): Promise<string | null> {
  if (!storagePath) {
    return null;
  }

  try {
    const [signedUrl] = await getStorageBucket()
      .file(storagePath)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + SIGNED_URL_EXPIRY_MS,
      });
    return signedUrl;
  } catch {
    return null;
  }
}

async function serializePet(pet: PetRecord): Promise<PetResponse> {
  const photoUrl = await resolvePhotoUrl(pet.photoUrl || undefined);
  return toPetResponse(pet, photoUrl);
}

export async function createPet(ownerId: string, input: CreatePetInput): Promise<PetResponse> {
  const db = getFirestore();
  const docRef = db.collection(COLLECTIONS.PETS).doc();
  const now = FieldValue.serverTimestamp();
  const dateOfBirth = input.dateOfBirth ? Timestamp.fromDate(parseDateInput(input.dateOfBirth)!) : null;

  const petData = {
    ownerId,
    name: input.name,
    species: input.species,
    breed: input.breed ?? '',
    gender: input.gender ?? 'Unknown',
    dateOfBirth,
    weight: input.weight ?? null,
    weightUnit: input.weightUnit ?? 'kg',
    photoUrl: '',
    microchipId: input.microchipId ?? '',
    allergies: input.allergies ?? [],
    medicalConditions: input.medicalConditions ?? [],
    bloodType: input.bloodType ?? '',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(petData);

  const created = await docRef.get();
  const pet = { id: created.id, ...created.data() } as PetRecord;

  logger.info('pet_created', { userId: ownerId, petId: pet.id });

  return serializePet(pet);
}

export async function listPets(
  ownerId: string,
  options: { pageSize?: number; cursor?: string },
): Promise<PaginatedResult<PetResponse>> {
  const pageSize = Math.min(options.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE);

  let query = getFirestore()
    .collection(COLLECTIONS.PETS)
    .where('ownerId', '==', ownerId)
    .where('isActive', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(pageSize + 1);

  if (options.cursor) {
    const cursorDoc = await getFirestore().collection(COLLECTIONS.PETS).doc(options.cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();
  const docs = snapshot.docs.slice(0, pageSize);
  const hasMore = snapshot.docs.length > pageSize;

  const items = await Promise.all(
    docs.map(async (doc) => serializePet({ id: doc.id, ...doc.data() } as PetRecord)),
  );

  return {
    items,
    nextCursor: hasMore ? docs[docs.length - 1].id : null,
    hasMore,
  };
}

export async function getPetByIdForOwner(petId: string, ownerId: string): Promise<PetResponse> {
  const pet = await assertActivePetOwner(petId, ownerId);
  return serializePet({ ...pet, id: petId });
}

export async function updatePet(
  petId: string,
  ownerId: string,
  input: UpdatePetInput,
): Promise<PetResponse> {
  await assertActivePetOwner(petId, ownerId);

  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (input.name !== undefined) updates.name = input.name;
  if (input.species !== undefined) updates.species = input.species;
  if (input.breed !== undefined) updates.breed = input.breed;
  if (input.gender !== undefined) updates.gender = input.gender;
  if (input.weight !== undefined) updates.weight = input.weight;
  if (input.weightUnit !== undefined) updates.weightUnit = input.weightUnit;
  if (input.allergies !== undefined) updates.allergies = input.allergies;
  if (input.medicalConditions !== undefined) updates.medicalConditions = input.medicalConditions;
  if (input.microchipId !== undefined) updates.microchipId = input.microchipId;
  if (input.bloodType !== undefined) updates.bloodType = input.bloodType;

  if (input.dateOfBirth !== undefined) {
    updates.dateOfBirth =
      input.dateOfBirth === null
        ? null
        : Timestamp.fromDate(parseDateInput(input.dateOfBirth)!);
  }

  const docRef = getFirestore().collection(COLLECTIONS.PETS).doc(petId);
  await docRef.update(updates);

  const updated = await docRef.get();
  return serializePet({ id: updated.id, ...updated.data() } as PetRecord);
}

export async function deactivatePet(petId: string, ownerId: string): Promise<PetResponse> {
  await assertPetOwner(petId, ownerId);

  const docRef = getFirestore().collection(COLLECTIONS.PETS).doc(petId);
  await docRef.update({
    isActive: false,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await docRef.get();
  return serializePet({ id: updated.id, ...updated.data() } as PetRecord);
}

export async function uploadPetPhoto(
  petId: string,
  ownerId: string,
  file: Express.Multer.File,
): Promise<PetResponse> {
  await assertActivePetOwner(petId, ownerId);

  const extension = extensionForMimeType(file.mimetype);
  const storagePath = `users/${ownerId}/pets/${petId}/profile/photo.${extension}`;
  const bucket = getStorageBucket();
  const storageFile = bucket.file(storagePath);

  await storageFile.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
      metadata: {
        petId,
        ownerId,
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  const docRef = getFirestore().collection(COLLECTIONS.PETS).doc(petId);
  await docRef.update({
    photoUrl: storagePath,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await docRef.get();
  logger.info('pet_photo_uploaded', { userId: ownerId, petId });

  return serializePet({ id: updated.id, ...updated.data() } as PetRecord);
}

export function stripForbiddenPetFields(body: Record<string, unknown>): Record<string, unknown> {
  const clone = { ...body };
  delete clone.ownerId;
  delete clone.isActive;
  delete clone.createdAt;
  delete clone.updatedAt;
  return clone;
}

// Exported for tests
export { toPetResponse, serializePet };
