import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { assertAuthenticated } from '../../shared/auth/authorization';
import { parsePaginationQuery } from '../../shared/utils/pagination';
import { validateUploadedFile } from '../../shared/utils/fileValidation';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { PET_PHOTO_LIMITS } from '../../config/constants';
import {
  createPet,
  deactivatePet,
  getPetByIdForOwner,
  listPets,
  stripForbiddenPetFields,
  updatePet,
  uploadPetPhoto,
} from './pet.service';
import { CreatePetSchema, UpdatePetSchema } from './pet.schema';

export async function createPetHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const input = req.body as CreatePetSchema;

  const pet = await createPet(user.uid, input);
  sendSuccess(res, pet, { message: 'Pet created successfully', statusCode: 201 });
}

export async function listPetsHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const pagination = parsePaginationQuery(req.query);

  const result = await listPets(user.uid, {
    pageSize: pagination.pageSize,
    cursor: pagination.cursor,
  });

  sendSuccess(res, result);
}

export async function getPetHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;

  const pet = await getPetByIdForOwner(petId, user.uid);
  sendSuccess(res, pet);
}

export async function updatePetHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const input = req.body as UpdatePetSchema;

  if ('ownerId' in req.body) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'You are not authorized to change pet ownership.');
  }

  const pet = await updatePet(petId, user.uid, input);
  sendSuccess(res, pet, { message: 'Pet updated successfully' });
}

export async function deletePetHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;

  const pet = await deactivatePet(petId, user.uid);
  sendSuccess(res, pet, { message: 'Pet deactivated successfully' });
}

export async function uploadPetPhotoHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;

  const file = validateUploadedFile(req.file, {
    maxSizeBytes: PET_PHOTO_LIMITS.MAX_SIZE_BYTES,
    allowedMimeTypes: PET_PHOTO_LIMITS.ALLOWED_MIME_TYPES,
  });

  const pet = await uploadPetPhoto(petId, user.uid, file);
  sendSuccess(res, pet, { message: 'Pet photo uploaded successfully' });
}

export { stripForbiddenPetFields };
