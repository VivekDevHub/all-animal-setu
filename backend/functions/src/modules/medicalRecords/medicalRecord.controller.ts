import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { assertAuthenticated } from '../../shared/auth/authorization';
import { parsePaginationQuery } from '../../shared/utils/pagination';
import {
  createMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecord,
  listMedicalRecords,
  updateMedicalRecord,
} from './medicalRecord.service';
import { CreateMedicalRecordSchema, UpdateMedicalRecordSchema } from './medicalRecord.schema';

export async function createMedicalRecordHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const record = await createMedicalRecord(petId, user.uid, req.body as CreateMedicalRecordSchema);
  sendSuccess(res, record, { message: 'Medical record created', statusCode: 201 });
}

export async function listMedicalRecordsHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const pagination = parsePaginationQuery(req.query);
  const result = await listMedicalRecords(petId, user.uid, pagination);
  sendSuccess(res, result);
}

export async function getMedicalRecordHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const recordId = req.params.recordId as string;
  const record = await getMedicalRecord(petId, recordId, user.uid);
  sendSuccess(res, record);
}

export async function updateMedicalRecordHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const recordId = req.params.recordId as string;
  const record = await updateMedicalRecord(
    petId,
    recordId,
    user.uid,
    req.body as UpdateMedicalRecordSchema,
  );
  sendSuccess(res, record, { message: 'Medical record updated' });
}

export async function deleteMedicalRecordHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const recordId = req.params.recordId as string;
  await deleteMedicalRecord(petId, recordId, user.uid);
  sendSuccess(res, { deleted: true }, { message: 'Medical record deleted' });
}
