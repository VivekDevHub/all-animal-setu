import { z } from 'zod';
import { MAPS_LIMITS, VET_SEARCH_TYPES } from '../../config/constants';

export const nearbyVetsQuerySchema = z.object({
  lat: z.coerce
    .number({ invalid_type_error: 'lat must be a valid number' })
    .min(MAPS_LIMITS.MIN_LATITUDE, `Latitude must be >= ${MAPS_LIMITS.MIN_LATITUDE}`)
    .max(MAPS_LIMITS.MAX_LATITUDE, `Latitude must be <= ${MAPS_LIMITS.MAX_LATITUDE}`),
  lng: z.coerce
    .number({ invalid_type_error: 'lng must be a valid number' })
    .min(MAPS_LIMITS.MIN_LONGITUDE, `Longitude must be >= ${MAPS_LIMITS.MIN_LONGITUDE}`)
    .max(MAPS_LIMITS.MAX_LONGITUDE, `Longitude must be <= ${MAPS_LIMITS.MAX_LONGITUDE}`),
  radius: z.coerce
    .number()
    .int()
    .positive()
    .max(
      MAPS_LIMITS.MAX_RADIUS_METERS,
      `Radius cannot exceed ${MAPS_LIMITS.MAX_RADIUS_METERS} meters (50km)`,
    )
    .default(MAPS_LIMITS.DEFAULT_RADIUS_METERS),
  type: z.enum(VET_SEARCH_TYPES).default('VET'),
});
