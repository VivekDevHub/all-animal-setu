import { Timestamp } from 'firebase-admin/firestore';
import { PetGender, PetSpecies, WeightUnit } from '../../config/constants';

export interface PetRecord {
  id?: string;
  ownerId: string;
  name: string;
  species: PetSpecies | string;
  breed: string;
  gender: PetGender | string;
  dateOfBirth: Timestamp | null;
  weight: number | null;
  weightUnit: WeightUnit | string;
  photoUrl: string;
  microchipId: string;
  allergies: string[];
  medicalConditions: string[];
  bloodType: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PetResponse {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  dateOfBirth: string | null;
  weight: number | null;
  weightUnit: string;
  photoUrl: string | null;
  microchipId: string;
  allergies: string[];
  medicalConditions: string[];
  bloodType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetInput {
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string;
  weight?: number;
  weightUnit?: string;
  allergies?: string[];
  medicalConditions?: string[];
  microchipId?: string;
  bloodType?: string;
}

export interface UpdatePetInput {
  name?: string;
  species?: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string | null;
  weight?: number | null;
  weightUnit?: string;
  allergies?: string[];
  medicalConditions?: string[];
  microchipId?: string;
  bloodType?: string;
}
