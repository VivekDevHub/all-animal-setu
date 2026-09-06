import { z } from 'zod';
import { MEDICAL_RECORD_TYPES } from '../../config/constants';

export const createMedicalRecordSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    type: z.enum(MEDICAL_RECORD_TYPES),
    description: z.string().trim().max(5000).optional().default(''),
    diagnosis: z.string().trim().max(2000).optional().default(''),
    doctorName: z.string().trim().max(100).optional().default(''),
    clinicName: z.string().trim().max(200).optional().default(''),
    visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'visitDate must be YYYY-MM-DD'),
    attachments: z.array(z.string().trim().min(1)).max(20).optional().default([]),
    ownerId: z.never().optional(),
    petId: z.never().optional(),
  })
  .strict();

export const updateMedicalRecordSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    type: z.enum(MEDICAL_RECORD_TYPES).optional(),
    description: z.string().trim().max(5000).optional(),
    diagnosis: z.string().trim().max(2000).optional(),
    doctorName: z.string().trim().max(100).optional(),
    clinicName: z.string().trim().max(200).optional(),
    visitDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'visitDate must be YYYY-MM-DD')
      .optional(),
    attachments: z.array(z.string().trim().min(1)).max(20).optional(),
    ownerId: z.never().optional(),
    petId: z.never().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type CreateMedicalRecordSchema = z.infer<typeof createMedicalRecordSchema>;
export type UpdateMedicalRecordSchema = z.infer<typeof updateMedicalRecordSchema>;
