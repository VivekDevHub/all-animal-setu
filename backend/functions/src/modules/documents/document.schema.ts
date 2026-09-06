import { z } from 'zod';

export const uploadDocumentFieldsSchema = z.object({
  petId: z.string().trim().min(1),
  recordId: z.string().trim().min(1).optional(),
  documentType: z.string().trim().min(1).max(50).default('MEDICAL'),
  runOcr: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((val) => val === true || val === 'true'),
  ownerId: z.never().optional(),
});

export const confirmOcrSchema = z
  .object({
    vaccineName: z.string().trim().min(1).max(200).optional(),
    dateGiven: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    vetName: z.string().trim().max(100).optional(),
    clinicName: z.string().trim().max(200).optional(),
    saveAsVaccination: z.boolean().optional().default(false),
  })
  .strict();

export type ConfirmOcrSchema = z.infer<typeof confirmOcrSchema>;
