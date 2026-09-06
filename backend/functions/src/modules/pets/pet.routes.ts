import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware';
import { requirePetOwner } from '../../middleware/roleMiddleware';
import { validateBody, validateParams, validateQuery } from '../../middleware/validationMiddleware';
import { uploadRateLimiter } from '../../middleware/rateLimitMiddleware';
import { asyncHandler } from '../../middleware/errorMiddleware';
import { petPhotoUpload } from '../../middleware/uploadMiddleware';
import { paginationQuerySchema } from '../../shared/utils/pagination';
import {
  createPetSchema,
  petIdParamSchema,
  updatePetSchema,
} from './pet.schema';
import {
  createPetHandler,
  deletePetHandler,
  getPetHandler,
  listPetsHandler,
  updatePetHandler,
  uploadPetPhotoHandler,
} from './pet.controller';
import { healthPassportRouter } from '../health/healthPassport.routes';
import { medicalRecordRouter } from '../medicalRecords/medicalRecord.routes';
import { vaccinationRouter } from '../vaccinations/vaccination.routes';
import { medicationRouter } from '../medications/medication.routes';

const router = Router();

router.post(
  '/',
  authenticateUser,
  requirePetOwner,
  validateBody(createPetSchema),
  asyncHandler(createPetHandler),
);

router.get(
  '/',
  authenticateUser,
  validateQuery(paginationQuerySchema),
  asyncHandler(listPetsHandler),
);

router.use('/:petId/health-passport', healthPassportRouter);
router.use('/:petId/medical-records', medicalRecordRouter);
router.use('/:petId/vaccinations', vaccinationRouter);
router.use('/:petId/medications', medicationRouter);

router.get(
  '/:petId',
  authenticateUser,
  validateParams(petIdParamSchema),
  asyncHandler(getPetHandler),
);

router.patch(
  '/:petId',
  authenticateUser,
  validateParams(petIdParamSchema),
  validateBody(updatePetSchema),
  asyncHandler(updatePetHandler),
);

router.delete(
  '/:petId',
  authenticateUser,
  validateParams(petIdParamSchema),
  asyncHandler(deletePetHandler),
);

router.post(
  '/:petId/photo',
  authenticateUser,
  uploadRateLimiter,
  validateParams(petIdParamSchema),
  petPhotoUpload.single('photo'),
  asyncHandler(uploadPetPhotoHandler),
);

export { router as petRouter };
