import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware';
import { validateBody, validateParams, validateQuery } from '../../middleware/validationMiddleware';
import { asyncHandler } from '../../middleware/errorMiddleware';
import { paginationQuerySchema } from '../../shared/utils/pagination';
import { petIdParamSchema, petMedicationParamSchema } from '../../shared/schemas/common.schema';
import { createMedicationSchema, updateMedicationSchema } from './medication.schema';
import {
  createMedicationHandler,
  deleteMedicationHandler,
  getMedicationHandler,
  listMedicationsHandler,
  updateMedicationHandler,
} from './medication.controller';

const router = Router({ mergeParams: true });

router.post('/', authenticateUser, validateParams(petIdParamSchema), validateBody(createMedicationSchema), asyncHandler(createMedicationHandler));
router.get('/', authenticateUser, validateParams(petIdParamSchema), validateQuery(paginationQuerySchema), asyncHandler(listMedicationsHandler));
router.get('/:medicationId', authenticateUser, validateParams(petMedicationParamSchema), asyncHandler(getMedicationHandler));
router.patch('/:medicationId', authenticateUser, validateParams(petMedicationParamSchema), validateBody(updateMedicationSchema), asyncHandler(updateMedicationHandler));
router.delete('/:medicationId', authenticateUser, validateParams(petMedicationParamSchema), asyncHandler(deleteMedicationHandler));

export { router as medicationRouter };
