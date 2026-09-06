import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { assertAuthenticated } from '../../shared/auth/authorization';
import { parsePaginationQuery } from '../../shared/utils/pagination';
import {
  createMedication,
  deleteMedication,
  getMedication,
  listMedications,
  updateMedication,
} from './medication.service';
import { CreateMedicationSchema, UpdateMedicationSchema } from './medication.schema';

export async function createMedicationHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const record = await createMedication(petId, user.uid, req.body as CreateMedicationSchema);
  sendSuccess(res, record, { message: 'Medication created', statusCode: 201 });
}

export async function listMedicationsHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const pagination = parsePaginationQuery(req.query);
  const result = await listMedications(petId, user.uid, pagination);
  sendSuccess(res, result);
}

export async function getMedicationHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const medicationId = req.params.medicationId as string;
  const record = await getMedication(petId, medicationId, user.uid);
  sendSuccess(res, record);
}

export async function updateMedicationHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const medicationId = req.params.medicationId as string;
  const record = await updateMedication(
    petId,
    medicationId,
    user.uid,
    req.body as UpdateMedicationSchema,
  );
  sendSuccess(res, record, { message: 'Medication updated' });
}

export async function deleteMedicationHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const medicationId = req.params.medicationId as string;
  await deleteMedication(petId, medicationId, user.uid);
  sendSuccess(res, { deleted: true }, { message: 'Medication deactivated' });
}
