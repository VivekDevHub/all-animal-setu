import { Router, Request, Response } from 'express';
import { getEnv } from '../config/env';
import { sendSuccess } from '../shared/responses/apiResponse';
import { authenticateUser } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';
import { asyncHandler } from '../middleware/errorMiddleware';
import { AppError, ERROR_CODES } from '../shared/errors';
import { petRouter } from '../modules/pets/pet.routes';
import { reminderRouter } from '../modules/reminders/reminder.routes';
import { documentRouter } from '../modules/documents/document.routes';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, {
      status: 'ok',
      service: getEnv().APP_NAME,
      version: getEnv().API_VERSION,
      environment: getEnv().APP_ENV,
      timestamp: new Date().toISOString(),
    });
  }),
);

router.get(
  '/health/protected',
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, {
      status: 'ok',
      uid: req.user!.uid,
      role: req.user!.profile?.role ?? null,
    });
  }),
);

router.get(
  '/health/admin',
  authenticateUser,
  requireAdmin,
  asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, { status: 'ok', access: 'admin' });
  }),
);

router.use('/pets', petRouter);
router.use('/reminders', reminderRouter);
router.use('/documents', documentRouter);

// Phase 3+ module routes will be mounted here
router.use((_req, _res, next) => {
  next(new AppError(ERROR_CODES.NOT_FOUND, 'API endpoint not found'));
});

export { router as apiRouter };
