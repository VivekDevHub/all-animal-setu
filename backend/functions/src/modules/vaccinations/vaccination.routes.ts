import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware';
import { validateBody, validateParams, validateQuery } from '../../middleware/validationMiddleware';
import { asyncHandler } from '../../middleware/errorMiddleware';
import { paginationQuerySchema } from '../../shared/utils/pagination';
import { petIdParamSchema, petVaccinationParamSchema } from '../../shared/schemas/common.schema';
import { createVaccinationSchema, updateVaccinationSchema } from './vaccination.schema';
import {
  createVaccinationHandler,
  deleteVaccinationHandler,
  getVaccinationHandler,
  listVaccinationsHandler,
  updateVaccinationHandler,
} from './vaccination.controller';

const router = Router({ mergeParams: true });

router.post('/', authenticateUser, validateParams(petIdParamSchema), validateBody(createVaccinationSchema), asyncHandler(createVaccinationHandler));
router.get('/', authenticateUser, validateParams(petIdParamSchema), validateQuery(paginationQuerySchema), asyncHandler(listVaccinationsHandler));
router.get('/:vaccinationId', authenticateUser, validateParams(petVaccinationParamSchema), asyncHandler(getVaccinationHandler));
router.patch('/:vaccinationId', authenticateUser, validateParams(petVaccinationParamSchema), validateBody(updateVaccinationSchema), asyncHandler(updateVaccinationHandler));
router.delete('/:vaccinationId', authenticateUser, validateParams(petVaccinationParamSchema), asyncHandler(deleteVaccinationHandler));

export { router as vaccinationRouter };
