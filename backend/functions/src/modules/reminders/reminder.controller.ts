import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { assertAuthenticated } from '../../shared/auth/authorization';
import { parsePaginationQuery } from '../../shared/utils/pagination';
import {
  createReminder,
  deleteReminder,
  getReminder,
  listReminders,
  updateReminder,
} from './reminder.service';
import { CreateReminderSchema, UpdateReminderSchema } from './reminder.schema';

export async function createReminderHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const reminder = await createReminder(user.uid, req.body as CreateReminderSchema);
  sendSuccess(res, reminder, { message: 'Reminder created', statusCode: 201 });
}

export async function listRemindersHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const pagination = parsePaginationQuery(req.query);
  const petId = typeof req.query.petId === 'string' ? req.query.petId : undefined;
  const result = await listReminders(user.uid, { ...pagination, petId });
  sendSuccess(res, result);
}

export async function getReminderHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const reminderId = req.params.reminderId as string;
  const reminder = await getReminder(reminderId, user.uid);
  sendSuccess(res, reminder);
}

export async function updateReminderHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const reminderId = req.params.reminderId as string;
  const reminder = await updateReminder(reminderId, user.uid, req.body as UpdateReminderSchema);
  sendSuccess(res, reminder, { message: 'Reminder updated' });
}

export async function deleteReminderHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const reminderId = req.params.reminderId as string;
  await deleteReminder(reminderId, user.uid);
  sendSuccess(res, { deleted: true }, { message: 'Reminder cancelled' });
}
