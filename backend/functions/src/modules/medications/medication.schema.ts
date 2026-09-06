import { z } from 'zod';
import { MEDICATION_FREQUENCIES } from '../../config/constants';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const createMedicationSchema = z
  .object({
    medicineName: z.string().trim().min(1).max(200),
    purpose: z.string().trim().max(500).optional().default(''),
    dosageText: z.string().trim().max(200).optional().default(''),
    frequency: z.enum(MEDICATION_FREQUENCIES).optional().default('DAILY'),
    startDate: dateSchema,
    endDate: dateSchema.nullable().optional(),
    prescribedBy: z.string().trim().max(100).optional().default(''),
    notes: z.string().trim().max(2000).optional().default(''),
    isActive: z.boolean().optional().default(true),
    ownerId: z.never().optional(),
    petId: z.never().optional(),
  })
  .strict();

export const updateMedicationSchema = z
  .object({
    medicineName: z.string().trim().min(1).max(200).optional(),
    purpose: z.string().trim().max(500).optional(),
    dosageText: z.string().trim().max(200).optional(),
    frequency: z.enum(MEDICATION_FREQUENCIES).optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.nullable().optional(),
    prescribedBy: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(2000).optional(),
    isActive: z.boolean().optional(),
    ownerId: z.never().optional(),
    petId: z.never().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type CreateMedicationSchema = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationSchema = z.infer<typeof updateMedicationSchema>;
