import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware';
import { validateBody, validateParams, validateQuery } from '../../middleware/validationMiddleware';
import { asyncHandler } from '../../middleware/errorMiddleware';
import { paginationQuerySchema } from '../../shared/utils/pagination';
import { petIdParamSchema, petRecordParamSchema } from '../../shared/schemas/common.schema';
import {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
} from './medicalRecord.schema';
import {
  createMedicalRecordHandler,
  deleteMedicalRecordHandler,
  getMedicalRecordHandler,
  listMedicalRecordsHandler,
  updateMedicalRecordHandler,
} from './medicalRecord.controller';

const router = Router({ mergeParams: true });

router.post(
  '/',
  authenticateUser,
  validateParams(petIdParamSchema),
  validateBody(createMedicalRecordSchema),
  asyncHandler(createMedicalRecordHandler),
);

router.get(
  '/',
  authenticateUser,
  validateParams(petIdParamSchema),
  validateQuery(paginationQuerySchema),
  asyncHandler(listMedicalRecordsHandler),
);

router.get(
  '/:recordId',
  authenticateUser,
  validateParams(petRecordParamSchema),
  asyncHandler(getMedicalRecordHandler),
);

router.patch(
  '/:recordId',
  authenticateUser,
  validateParams(petRecordParamSchema),
  validateBody(updateMedicalRecordSchema),
  asyncHandler(updateMedicalRecordHandler),
);

router.delete(
  '/:recordId',
  authenticateUser,
  validateParams(petRecordParamSchema),
  asyncHandler(deleteMedicalRecordHandler),
);

export { router as medicalRecordRouter };
