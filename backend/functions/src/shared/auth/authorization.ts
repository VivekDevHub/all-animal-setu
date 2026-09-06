import { Request } from 'express';
import { getFirestore } from '../../config/firebase';
import { COLLECTIONS } from '../../config/constants';
import { AppError, ERROR_CODES } from '../errors';
import { AuthenticatedUser } from '../types/user.types';
import { PetRecord } from '../../modules/pets/pet.types';

export function assertAuthenticated(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, 'Authentication required');
  }
  return req.user;
}

export async function getPetRecord(petId: string): Promise<PetRecord | null> {
  const doc = await getFirestore().collection(COLLECTIONS.PETS).doc(petId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() } as PetRecord;
}

export async function assertPetOwner(petId: string, userId: string): Promise<PetRecord> {
  const pet = await getPetRecord(petId);

  if (!pet) {
    throw new AppError(ERROR_CODES.PET_NOT_FOUND, 'Pet not found');
  }

  if (pet.ownerId !== userId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'You are not authorized to access this pet.');
  }

  return pet;
}

export async function assertActivePetOwner(petId: string, userId: string): Promise<PetRecord> {
  const pet = await assertPetOwner(petId, userId);

  if (!pet.isActive) {
    throw new AppError(ERROR_CODES.PET_NOT_FOUND, 'Pet not found');
  }

  return pet;
}

/**
 * Vet access extension point for later phases.
 * Currently only pet owners (and admins) can access pet data.
 */
export async function assertPetAccess(
  petId: string,
  user: AuthenticatedUser,
): Promise<PetRecord> {
  const pet = await assertActivePetOwner(petId, user.uid);

  if (user.profile?.role === 'ADMIN') {
    return pet;
  }

  // Future: check vet appointment / consultation relationship here
  return pet;
}
