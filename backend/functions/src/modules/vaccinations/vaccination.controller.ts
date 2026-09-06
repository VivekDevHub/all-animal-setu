import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { assertAuthenticated } from '../../shared/auth/authorization';
import { parsePaginationQuery } from '../../shared/utils/pagination';
import {
  createVaccination,
  deleteVaccination,
  getVaccination,
  listVaccinations,
  updateVaccination,
} from './vaccination.service';
import { CreateVaccinationSchema, UpdateVaccinationSchema } from './vaccination.schema';

export async function createVaccinationHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const record = await createVaccination(petId, user.uid, req.body as CreateVaccinationSchema);
  sendSuccess(res, record, { message: 'Vaccination created', statusCode: 201 });
}

export async function listVaccinationsHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const pagination = parsePaginationQuery(req.query);
  const result = await listVaccinations(petId, user.uid, pagination);
  sendSuccess(res, result);
}

export async function getVaccinationHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const vaccinationId = req.params.vaccinationId as string;
  const record = await getVaccination(petId, vaccinationId, user.uid);
  sendSuccess(res, record);
}

export async function updateVaccinationHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const vaccinationId = req.params.vaccinationId as string;
  const record = await updateVaccination(
    petId,
    vaccinationId,
    user.uid,
    req.body as UpdateVaccinationSchema,
  );
  sendSuccess(res, record, { message: 'Vaccination updated' });
}

export async function deleteVaccinationHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const vaccinationId = req.params.vaccinationId as string;
  await deleteVaccination(petId, vaccinationId, user.uid);
  sendSuccess(res, { deleted: true }, { message: 'Vaccination deleted' });
}
