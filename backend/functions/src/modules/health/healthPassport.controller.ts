import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { assertAuthenticated } from '../../shared/auth/authorization';
import { getHealthPassport, upsertHealthPassport } from './healthPassport.service';
import { UpsertHealthPassportSchema } from './healthPassport.schema';

export async function getHealthPassportHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const passport = await getHealthPassport(petId, user.uid);
  sendSuccess(res, passport);
}

export async function upsertHealthPassportHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const input = req.body as UpsertHealthPassportSchema;
  const passport = await upsertHealthPassport(petId, user.uid, input);
  sendSuccess(res, passport, { message: 'Health passport updated successfully' });
}
