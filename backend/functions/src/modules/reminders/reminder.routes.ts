import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware';
import { validateBody, validateParams, validateQuery } from '../../middleware/validationMiddleware';
import { asyncHandler } from '../../middleware/errorMiddleware';
import { paginationQuerySchema } from '../../shared/utils/pagination';
import { reminderIdParamSchema } from '../../shared/schemas/common.schema';
import { createReminderSchema, updateReminderSchema } from './reminder.schema';
import {
  createReminderHandler,
  deleteReminderHandler,
  getReminderHandler,
  listRemindersHandler,
  updateReminderHandler,
} from './reminder.controller';

const router = Router();

router.post(
  '/',
  authenticateUser,
  validateBody(createReminderSchema),
  asyncHandler(createReminderHandler),
);

router.get(
  '/',
  authenticateUser,
  validateQuery(paginationQuerySchema),
  asyncHandler(listRemindersHandler),
);

router.get(
  '/:reminderId',
  authenticateUser,
  validateParams(reminderIdParamSchema),
  asyncHandler(getReminderHandler),
);

router.patch(
  '/:reminderId',
  authenticateUser,
  validateParams(reminderIdParamSchema),
  validateBody(updateReminderSchema),
  asyncHandler(updateReminderHandler),
);

router.delete(
  '/:reminderId',
  authenticateUser,
  validateParams(reminderIdParamSchema),
  asyncHandler(deleteReminderHandler),
);

export { router as reminderRouter };
