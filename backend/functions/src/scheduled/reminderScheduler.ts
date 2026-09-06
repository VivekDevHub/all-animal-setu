import { onSchedule } from 'firebase-functions/v2/scheduler';
import { processDueReminders } from '../modules/reminders/reminder.service';
import { logger } from '../shared/logger/logger';

export const processReminders = onSchedule(
  {
    schedule: 'every 60 minutes',
    region: 'asia-south1',
    timeZone: 'Asia/Kolkata',
  },
  async () => {
    const processed = await processDueReminders();
    logger.info('reminder_scheduler_completed', { processed });
  },
);
