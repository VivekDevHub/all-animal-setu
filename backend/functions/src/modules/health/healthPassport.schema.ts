import { z } from 'zod';
import { emergencyContactSchema, stringArraySchema } from '../../shared/schemas/common.schema';

export const upsertHealthPassportSchema = z
  .object({
    bloodType: z.string().trim().max(20).optional(),
    allergies: stringArraySchema.optional(),
    medicalConditions: stringArraySchema.optional(),
    currentMedicationsSummary: stringArraySchema.optional(),
    vaccinationSummary: z.string().trim().max(2000).optional(),
    emergencyContact: emergencyContactSchema.optional(),
    primaryVetId: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(5000).optional(),
    ownerId: z.never().optional(),
    petId: z.never().optional(),
  })
  .strict();

export type UpsertHealthPassportSchema = z.infer<typeof upsertHealthPassportSchema>;
