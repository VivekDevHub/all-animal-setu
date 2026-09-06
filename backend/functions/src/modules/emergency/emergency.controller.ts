import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { assertAuthenticated } from '../../shared/auth/authorization';
import {
  createEmergency,
  getEmergencyById,
  getEmergencyCard,
  listEmergencies,
  updateEmergencyStatus,
} from '../../services/emergency/emergencyService';

export async function createEmergencyHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const result = await createEmergency(user.uid, req.body);
  sendSuccess(res, result, { statusCode: 201 });
}

export async function listEmergenciesHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const emergencies = await listEmergencies(user.uid);
  sendSuccess(res, { emergencies }, { statusCode: 200 });
}

export async function getEmergencyHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const emergencyId = req.params.emergencyId as string;
  const result = await getEmergencyById(user.uid, emergencyId, user.profile?.role);
  sendSuccess(res, result, { statusCode: 200 });
}

export async function updateEmergencyStatusHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const emergencyId = req.params.emergencyId as string;
  const result = await updateEmergencyStatus(
    user.uid,
    emergencyId,
    req.body,
    user.profile?.role,
  );
  sendSuccess(res, result, { statusCode: 200 });
}

export async function getEmergencyCardHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const petId = req.params.petId as string;
  const result = await getEmergencyCard(user.uid, petId);
  sendSuccess(res, result, { statusCode: 200 });
}
