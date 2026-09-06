import { Timestamp } from 'firebase-admin/firestore';
import { getFirestore } from '../../config/firebase';
import { COLLECTIONS, SUBCOLLECTIONS } from '../../config/constants';
import { assertActivePetOwner } from '../../shared/auth/authorization';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { logger } from '../../shared/logger/logger';
import { timestampToIso } from '../../shared/utils/serialize';
import {
  CreateEmergencyInput,
  EmergencyCardResponse,
  EmergencyRecord,
  EmergencyResponse,
  UpdateEmergencyStatusInput,
} from '../../modules/emergency/emergency.types';
import {
  createEmergencyRecord,
  findEmergencyById,
  listEmergenciesForUser,
  updateEmergencyRecordStatus,
} from '../../repositories/emergencyRepository';
import { fetchPlacesFromGoogle } from '../maps/placesService';
import { createAuditLog } from '../audit/auditService';
import { getHealthPassport } from '../../modules/health/healthPassport.service';
import { VaccinationRecord } from '../../modules/vaccinations/vaccination.types';

function toEmergencyResponse(
  record: EmergencyRecord,
  nearbyFacilities: EmergencyResponse['nearbyFacilities'] = [],
): EmergencyResponse {
  return {
    emergencyId: record.id,
    userId: record.userId,
    petId: record.petId,
    urgency: record.urgency,
    status: record.status,
    message: 'Seek immediate veterinary care.',
    description: record.description,
    latitude: record.latitude,
    longitude: record.longitude,
    nearbyFacilities,
    healthCardAvailable: true,
    createdAt: timestampToIso(record.createdAt as Timestamp)!,
    updatedAt: timestampToIso(record.updatedAt as Timestamp)!,
  };
}

export async function createEmergency(
  userId: string,
  input: CreateEmergencyInput,
): Promise<EmergencyResponse> {
  // 1. Verify pet ownership
  const pet = await assertActivePetOwner(input.petId, userId);

  // 2. Fetch nearby emergency facilities (fail-safe: do not crash emergency if places API has an issue)
  let nearbyFacilities: EmergencyResponse['nearbyFacilities'] = [];
  try {
    nearbyFacilities = await fetchPlacesFromGoogle(
      input.latitude,
      input.longitude,
      15000,
      'EMERGENCY',
    );
  } catch (error) {
    logger.warn('emergency_places_fetch_failed', {
      userId,
      petId: pet.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // 3. Persist emergency record
  const record = await createEmergencyRecord({
    userId,
    petId: pet.id!,
    latitude: input.latitude,
    longitude: input.longitude,
    description: input.description,
    urgency: 'EMERGENCY',
    status: 'OPEN',
  });

  logger.info('emergency_created', {
    userId,
    petId: pet.id,
    emergencyId: record.id,
  });

  void createAuditLog({
    userId,
    action: 'EMERGENCY_CREATED',
    resourceType: 'EMERGENCY',
    resourceId: record.id,
    metadata: { petId: pet.id, urgency: 'EMERGENCY' },
  });

  return toEmergencyResponse(record, nearbyFacilities);
}

export async function getEmergencyById(
  userId: string,
  emergencyId: string,
  role?: string,
): Promise<EmergencyResponse> {
  const record = await findEmergencyById(emergencyId);
  if (!record) {
    throw new AppError(ERROR_CODES.EMERGENCY_NOT_FOUND, 'Emergency record not found');
  }

  if (record.userId !== userId && role !== 'ADMIN') {
    throw new AppError(
      ERROR_CODES.FORBIDDEN,
      'You are not authorized to view this emergency record',
    );
  }

  let nearbyFacilities: EmergencyResponse['nearbyFacilities'] = [];
  try {
    nearbyFacilities = await fetchPlacesFromGoogle(
      record.latitude,
      record.longitude,
      15000,
      'EMERGENCY',
    );
  } catch {
    // Fail-safe
  }

  return toEmergencyResponse(record, nearbyFacilities);
}

export async function listEmergencies(userId: string): Promise<EmergencyResponse[]> {
  const records = await listEmergenciesForUser(userId);
  return records.map((rec) => toEmergencyResponse(rec, []));
}

export async function updateEmergencyStatus(
  userId: string,
  emergencyId: string,
  input: UpdateEmergencyStatusInput,
  role?: string,
): Promise<EmergencyResponse> {
  const existing = await findEmergencyById(emergencyId);
  if (!existing) {
    throw new AppError(ERROR_CODES.EMERGENCY_NOT_FOUND, 'Emergency record not found');
  }

  if (existing.userId !== userId && role !== 'ADMIN') {
    throw new AppError(
      ERROR_CODES.FORBIDDEN,
      'You are not authorized to modify this emergency record',
    );
  }

  const updated = await updateEmergencyRecordStatus(emergencyId, input);
  if (!updated) {
    throw new AppError(ERROR_CODES.EMERGENCY_NOT_FOUND, 'Failed to update emergency status');
  }

  logger.info('emergency_resolved', {
    userId,
    emergencyId,
    emergencyStatus: input.status,
  });

  void createAuditLog({
    userId,
    action: `EMERGENCY_${input.status}`,
    resourceType: 'EMERGENCY',
    resourceId: emergencyId,
    metadata: { emergencyStatus: input.status },
  });

  return toEmergencyResponse(updated);
}

export async function getEmergencyCard(
  userId: string,
  petId: string,
): Promise<EmergencyCardResponse> {
  // 1. Verify ownership of the pet
  const pet = await assertActivePetOwner(petId, userId);

  // 2. Fetch owner contact information
  let ownerName = 'Pet Owner';
  let ownerPhone = '';
  try {
    const userDoc = await getFirestore().collection(COLLECTIONS.USERS).doc(userId).get();
    if (userDoc.exists) {
      const data = userDoc.data() || {};
      ownerName = data.displayName || data.name || 'Pet Owner';
      ownerPhone = data.phoneNumber || data.phone || '';
    }
  } catch {
    // Fallback default
  }

  // 3. Fetch critical health information from health passport & pet profile
  const allergies = pet.allergies || [];
  const medicalConditions = pet.medicalConditions || [];
  let medications: string[] = [];

  try {
    const passport = await getHealthPassport(petId, userId);
    if (passport.allergies?.length) {
      for (const a of passport.allergies) {
        if (!allergies.includes(a)) allergies.push(a);
      }
    }
    if (passport.medicalConditions?.length) {
      for (const mc of passport.medicalConditions) {
        if (!medicalConditions.includes(mc)) medicalConditions.push(mc);
      }
    }
    if (passport.currentMedicationsSummary?.length) {
      medications = passport.currentMedicationsSummary;
    }
  } catch {
    // Passport is optional
  }

  // 4. Fetch vaccinations
  let vaccinations: EmergencyCardResponse['vaccinations'] = [];
  try {
    const vaccSnapshot = await getFirestore()
      .collection(COLLECTIONS.PETS)
      .doc(petId)
      .collection(SUBCOLLECTIONS.VACCINATIONS)
      .orderBy('dateGiven', 'desc')
      .limit(10)
      .get();

    vaccinations = vaccSnapshot.docs.map((doc) => {
      const v = doc.data() as VaccinationRecord;
      return {
        name: v.vaccineName,
        dateGiven: timestampToIso(v.dateGiven),
        expiresAt: timestampToIso(v.nextDueDate),
      };
    });
  } catch {
    // Optional
  }

  return {
    pet: {
      id: pet.id!,
      name: pet.name,
      species: pet.species,
      breed: pet.breed || 'Unknown',
      gender: pet.gender || 'Unknown',
      weight: pet.weight,
      weightUnit: pet.weightUnit,
      bloodType: pet.bloodType || undefined,
    },
    owner: {
      name: ownerName,
      phone: ownerPhone,
    },
    criticalInformation: {
      allergies,
      medicalConditions,
      medications,
    },
    vaccinations,
  };
}
