import { z } from 'zod';
import { PET_GENDERS, PET_SPECIES, WEIGHT_UNITS } from '../../config/constants';

const stringArraySchema = z.array(z.string().trim().min(1).max(100)).max(50).default([]);

const forbiddenFields = z.never().optional();

export const createPetSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    species: z.enum(PET_SPECIES, {
      errorMap: () => ({ message: 'Unsupported species' }),
    }),
    breed: z.string().trim().max(100).optional().default(''),
    gender: z.enum(PET_GENDERS).optional().default('Unknown'),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateOfBirth must be YYYY-MM-DD')
      .optional(),
    weight: z.number().positive('Weight must be greater than zero').max(1000).optional(),
    weightUnit: z.enum(WEIGHT_UNITS).optional().default('kg'),
    allergies: stringArraySchema,
    medicalConditions: stringArraySchema,
    microchipId: z.string().trim().max(100).optional().default(''),
    bloodType: z.string().trim().max(20).optional().default(''),
    ownerId: forbiddenFields,
    isActive: forbiddenFields,
    createdAt: forbiddenFields,
    updatedAt: forbiddenFields,
  })
  .strict();

export const updatePetSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    species: z.enum(PET_SPECIES).optional(),
    breed: z.string().trim().max(100).optional(),
    gender: z.enum(PET_GENDERS).optional(),
    dateOfBirth: z
      .union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateOfBirth must be YYYY-MM-DD'),
        z.null(),
      ])
      .optional(),
    weight: z.number().positive().max(1000).nullable().optional(),
    weightUnit: z.enum(WEIGHT_UNITS).optional(),
    allergies: stringArraySchema.optional(),
    medicalConditions: stringArraySchema.optional(),
    microchipId: z.string().trim().max(100).optional(),
    bloodType: z.string().trim().max(20).optional(),
    ownerId: forbiddenFields,
    isActive: forbiddenFields,
    createdAt: forbiddenFields,
    updatedAt: forbiddenFields,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const petIdParamSchema = z.object({
  petId: z.string().trim().min(1, 'petId is required'),
});

export type CreatePetSchema = z.infer<typeof createPetSchema>;
export type UpdatePetSchema = z.infer<typeof updatePetSchema>;
