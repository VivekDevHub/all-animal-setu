import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Timestamp } from 'firebase-admin/firestore';
import { assertActivePetOwner, assertPetOwner } from '../auth/authorization';
import { AppError, ERROR_CODES } from '../errors';

const mockGet = vi.fn();

vi.mock('../../config/firebase', () => ({
  getFirestore: () => ({
    collection: () => ({
      doc: () => ({
        get: mockGet,
      }),
    }),
  }),
}));

function buildPetDoc(ownerId: string, isActive = true) {
  return {
    exists: true,
    id: 'pet-1',
    data: () => ({
      ownerId,
      name: 'Bruno',
      species: 'Dog',
      breed: '',
      gender: 'Male',
      dateOfBirth: null,
      weight: null,
      weightUnit: 'kg',
      photoUrl: '',
      microchipId: '',
      allergies: [],
      medicalConditions: [],
      bloodType: '',
      isActive,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }),
  };
}

describe('pet authorization helpers', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('allows owner access', async () => {
    mockGet.mockResolvedValue(buildPetDoc('user-a'));

    const pet = await assertPetOwner('pet-1', 'user-a');
    expect(pet.ownerId).toBe('user-a');
  });

  it('denies access to another user pet', async () => {
    mockGet.mockResolvedValue(buildPetDoc('user-b'));

    await expect(assertPetOwner('pet-1', 'user-a')).rejects.toMatchObject({
      code: ERROR_CODES.FORBIDDEN,
    });
  });

  it('returns PET_NOT_FOUND for missing pet', async () => {
    mockGet.mockResolvedValue({ exists: false });

    await expect(assertPetOwner('missing', 'user-a')).rejects.toMatchObject({
      code: ERROR_CODES.PET_NOT_FOUND,
    });
  });

  it('treats inactive pet as not found for active access', async () => {
    mockGet.mockResolvedValue(buildPetDoc('user-a', false));

    await expect(assertActivePetOwner('pet-1', 'user-a')).rejects.toMatchObject({
      code: ERROR_CODES.PET_NOT_FOUND,
    });
  });
});

describe('AppError forbidden message', () => {
  it('uses standardized pet access message', async () => {
    mockGet.mockResolvedValue(buildPetDoc('user-b'));

    try {
      await assertPetOwner('pet-1', 'user-a');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).message).toBe('You are not authorized to access this pet.');
    }
  });
});
