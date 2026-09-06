import { describe, it, expect } from 'vitest';
import { subDays } from 'date-fns';
import { computeVaccinationReminderDate } from './reminder.service';
import { DEFAULT_VACCINATION_REMINDER_DAYS_BEFORE } from '../../config/constants';

describe('computeVaccinationReminderDate', () => {
  it('schedules reminder before due date using configured window', () => {
    const dueDate = new Date('2026-08-10T00:00:00.000Z');
    const reminderDate = computeVaccinationReminderDate(dueDate);

    expect(reminderDate.toISOString()).toBe(
      subDays(dueDate, DEFAULT_VACCINATION_REMINDER_DAYS_BEFORE).toISOString(),
    );
  });
});
