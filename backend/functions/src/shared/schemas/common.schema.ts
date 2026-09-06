import { z } from 'zod';

export const petIdParamSchema = z.object({
  petId: z.string().trim().min(1, 'petId is required'),
});

export const petResourceParamSchema = petIdParamSchema.extend({
  recordId: z.string().trim().min(1).optional(),
  vaccinationId: z.string().trim().min(1).optional(),
  medicationId: z.string().trim().min(1).optional(),
});

export const petRecordParamSchema = petIdParamSchema.extend({
  recordId: z.string().trim().min(1, 'recordId is required'),
});

export const petVaccinationParamSchema = petIdParamSchema.extend({
  vaccinationId: z.string().trim().min(1, 'vaccinationId is required'),
});

export const petMedicationParamSchema = petIdParamSchema.extend({
  medicationId: z.string().trim().min(1, 'medicationId is required'),
});

export const reminderIdParamSchema = z.object({
  reminderId: z.string().trim().min(1, 'reminderId is required'),
});

export const documentIdParamSchema = z.object({
  documentId: z.string().trim().min(1, 'documentId is required'),
});

const stringArraySchema = z.array(z.string().trim().min(1).max(100)).max(50);

export const emergencyContactSchema = z.object({
  name: z.string().trim().max(100).default(''),
  phone: z.string().trim().max(20).default(''),
});

export { stringArraySchema };
