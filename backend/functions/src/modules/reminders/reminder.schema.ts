import { z } from 'zod';
import { REMINDER_STATUSES, REMINDER_TYPES } from '../../config/constants';

export const createReminderSchema = z
  .object({
    petId: z.string().trim().min(1),
    type: z.enum(REMINDER_TYPES),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional().default(''),
    scheduledAt: z.string().datetime({ message: 'scheduledAt must be ISO datetime' }),
    userId: z.never().optional(),
  })
  .strict();

export const updateReminderSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    scheduledAt: z.string().datetime().optional(),
    status: z.enum(REMINDER_STATUSES).optional(),
    userId: z.never().optional(),
    petId: z.never().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type CreateReminderSchema = z.infer<typeof createReminderSchema>;
export type UpdateReminderSchema = z.infer<typeof updateReminderSchema>;

export function buildSourceReminderId(sourceType: string, sourceId: string): string {
  return `${sourceType}_${sourceId}`;
}
