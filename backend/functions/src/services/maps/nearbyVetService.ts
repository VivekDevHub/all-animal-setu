import { VetSearchType } from '../../config/constants';
import { logger } from '../../shared/logger/logger';
import { NearbyVetsResponse } from '../../modules/vets/vet.types';
import { fetchPlacesFromGoogle } from './placesService';

export async function findNearbyVets(
  userId: string,
  lat: number,
  lng: number,
  radius: number,
  type: VetSearchType,
): Promise<NearbyVetsResponse> {
  logger.info('places_search', {
    userId,
    type,
    radius,
  });

  const places = await fetchPlacesFromGoogle(lat, lng, radius, type);

  return {
    places,
    count: places.length,
    type,
    radiusMeters: radius,
  };
}
