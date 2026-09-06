import { z } from 'zod';
import { AI_LIMITS, EMERGENCY_STATUSES, MAPS_LIMITS } from '../../config/constants';

export const createEmergencySchema = z.object({
  petId: z.string().min(1, 'petId is required'),
  latitude: z.coerce
    .number({ invalid_type_error: 'latitude must be a valid number' })
    .min(MAPS_LIMITS.MIN_LATITUDE, `Latitude must be >= ${MAPS_LIMITS.MIN_LATITUDE}`)
    .max(MAPS_LIMITS.MAX_LATITUDE, `Latitude must be <= ${MAPS_LIMITS.MAX_LATITUDE}`),
  longitude: z.coerce
    .number({ invalid_type_error: 'longitude must be a valid number' })
    .min(MAPS_LIMITS.MIN_LONGITUDE, `Longitude must be >= ${MAPS_LIMITS.MIN_LONGITUDE}`)
    .max(MAPS_LIMITS.MAX_LONGITUDE, `Longitude must be <= ${MAPS_LIMITS.MAX_LONGITUDE}`),
  description: z
    .string()
    .trim()
    .min(1, 'description is required')
    .max(AI_LIMITS.MAX_DESCRIPTION_LENGTH),
});

export const updateEmergencyStatusSchema = z.object({
  status: z.enum(EMERGENCY_STATUSES),
  resolutionNotes: z.string().trim().max(1000).optional(),
});

export const emergencyIdParamSchema = z.object({
  emergencyId: z.string().min(1, 'emergencyId is required'),
});

export const petIdParamSchema = z.object({
  petId: z.string().min(1, 'petId is required'),
});
