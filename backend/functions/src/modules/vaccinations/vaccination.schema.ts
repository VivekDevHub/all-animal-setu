import { z } from 'zod';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const createVaccinationSchema = z
  .object({
    vaccineName: z.string().trim().min(1).max(200),
    dateGiven: dateSchema,
    nextDueDate: dateSchema.nullable().optional(),
    vetName: z.string().trim().max(100).optional().default(''),
    clinicName: z.string().trim().max(200).optional().default(''),
    batchNumber: z.string().trim().max(100).optional().default(''),
    documentUrl: z.string().trim().max(500).optional().default(''),
    notes: z.string().trim().max(2000).optional().default(''),
    ownerId: z.never().optional(),
    petId: z.never().optional(),
  })
  .strict();

export const updateVaccinationSchema = z
  .object({
    vaccineName: z.string().trim().min(1).max(200).optional(),
    dateGiven: dateSchema.optional(),
    nextDueDate: dateSchema.nullable().optional(),
    vetName: z.string().trim().max(100).optional(),
    clinicName: z.string().trim().max(200).optional(),
    batchNumber: z.string().trim().max(100).optional(),
    documentUrl: z.string().trim().max(500).optional(),
    notes: z.string().trim().max(2000).optional(),
    ownerId: z.never().optional(),
    petId: z.never().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type CreateVaccinationSchema = z.infer<typeof createVaccinationSchema>;
export type UpdateVaccinationSchema = z.infer<typeof updateVaccinationSchema>;
