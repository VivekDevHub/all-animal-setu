import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { assertAuthenticated } from '../../shared/auth/authorization';
import { findNearbyVets } from '../../services/maps/nearbyVetService';
import { NearbyVetsQuery } from './vet.types';

export async function getNearbyVetsHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const { lat, lng, radius, type } = req.query as unknown as NearbyVetsQuery;

  const result = await findNearbyVets(
    user.uid,
    lat,
    lng,
    radius ?? 5000,
    type ?? 'VET',
  );

  sendSuccess(res, result, { statusCode: 200 });
}
