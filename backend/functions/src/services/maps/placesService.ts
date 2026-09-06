import { getEnv } from '../../config/env';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { logger } from '../../shared/logger/logger';
import { NormalizedPlace, PlaceLocation } from '../../modules/vets/vet.types';
import { VetSearchType } from '../../config/constants';

interface CacheEntry {
  data: NormalizedPlace[];
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
const placesCache = new Map<string, CacheEntry>();

export function calculateDistanceMeters(loc1: PlaceLocation, loc2: PlaceLocation): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (loc1.lat * Math.PI) / 180;
  const φ2 = (loc2.lat * Math.PI) / 180;
  const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function generateCacheKey(lat: number, lng: number, radius: number, type: VetSearchType): string {
  // Round coordinates to ~100m precision for cache aggregation
  const roundedLat = lat.toFixed(3);
  const roundedLng = lng.toFixed(3);
  return `${roundedLat}:${roundedLng}:${radius}:${type}`;
}

export function clearPlacesCacheForTests(): void {
  placesCache.clear();
}

export function getKeywordsForType(type: VetSearchType): { queryKeyword: string; includedTypes: string[] } {
  switch (type) {
    case 'EMERGENCY':
      return {
        queryKeyword: '24 hour emergency veterinary hospital',
        includedTypes: ['veterinary_care', 'hospital'],
      };
    case 'HOSPITAL':
      return {
        queryKeyword: 'veterinary hospital',
        includedTypes: ['veterinary_care', 'hospital'],
      };
    case 'VET':
    default:
      return {
        queryKeyword: 'veterinary clinic',
        includedTypes: ['veterinary_care'],
      };
  }
}

export async function fetchPlacesFromGoogle(
  lat: number,
  lng: number,
  radius: number,
  type: VetSearchType,
): Promise<NormalizedPlace[]> {
  const cacheKey = generateCacheKey(lat, lng, radius, type);
  const cached = placesCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const env = getEnv();
  const apiKey = env.GOOGLE_PLACES_API_KEY || env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new AppError(
      ERROR_CODES.PLACES_SERVICE_UNAVAILABLE,
      'Nearby veterinary services are temporarily unavailable.',
    );
  }

  const { queryKeyword } = getKeywordsForType(type);
  const origin: PlaceLocation = { lat, lng };

  try {
    // Try Google Places API (New) searchNearby
    const url = 'https://places.googleapis.com/v1/places:searchNearby';
    const requestBody = {
      includedTypes: ['veterinary_care'],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius,
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.types,places.googleMapsUri,places.nationalPhoneNumber',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      // If Places API New fails or is not enabled, fallback to legacy Nearby Search
      return await fallbackLegacyPlacesSearch(lat, lng, radius, queryKeyword, apiKey, origin, cacheKey);
    }

    const data = (await response.json()) as {
      places?: Array<{
        id: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        location?: { latitude: number; longitude: number };
        rating?: number;
        userRatingCount?: number;
        currentOpeningHours?: { openNow?: boolean };
        types?: string[];
        googleMapsUri?: string;
        nationalPhoneNumber?: string;
      }>;
    };

    const rawPlaces = data.places || [];
    const normalized: NormalizedPlace[] = rawPlaces.map((p) => {
      const placeLocation: PlaceLocation = {
        lat: p.location?.latitude ?? lat,
        lng: p.location?.longitude ?? lng,
      };

      return {
        id: p.id,
        name: p.displayName?.text || 'Veterinary Facility',
        address: p.formattedAddress || 'Address not available',
        location: placeLocation,
        rating: p.rating ?? null,
        userRatingCount: p.userRatingCount ?? 0,
        isOpen: p.currentOpeningHours?.openNow ?? null,
        distanceMeters: calculateDistanceMeters(origin, placeLocation),
        types: p.types || [],
        googleMapsUri: p.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${placeLocation.lat},${placeLocation.lng}`,
        phoneNumber: p.nationalPhoneNumber,
      };
    });

    normalized.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));

    placesCache.set(cacheKey, { data: normalized, expiresAt: now + CACHE_TTL_MS });
    return normalized;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('places_search_error', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(
      ERROR_CODES.PLACES_SERVICE_UNAVAILABLE,
      'Nearby veterinary services are temporarily unavailable.',
    );
  }
}

async function fallbackLegacyPlacesSearch(
  lat: number,
  lng: number,
  radius: number,
  keyword: string,
  apiKey: string,
  origin: PlaceLocation,
  cacheKey: string,
): Promise<NormalizedPlace[]> {
  const legacyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;

  const res = await fetch(legacyUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    throw new AppError(
      ERROR_CODES.PLACES_SERVICE_UNAVAILABLE,
      'Nearby veterinary services are temporarily unavailable.',
    );
  }

  const result = (await res.json()) as {
    status?: string;
    results?: Array<{
      place_id: string;
      name: string;
      vicinity?: string;
      geometry?: { location?: { lat: number; lng: number } };
      rating?: number;
      user_ratings_total?: number;
      opening_hours?: { open_now?: boolean };
      types?: string[];
    }>;
  };

  if (result.status !== 'OK' && result.status !== 'ZERO_RESULTS') {
    logger.warn('places_legacy_status_error', { googleStatus: result.status });
    throw new AppError(
      ERROR_CODES.PLACES_SERVICE_UNAVAILABLE,
      'Nearby veterinary services are temporarily unavailable.',
    );
  }

  const items = result.results || [];
  const normalized: NormalizedPlace[] = items.map((item) => {
    const loc: PlaceLocation = {
      lat: item.geometry?.location?.lat ?? lat,
      lng: item.geometry?.location?.lng ?? lng,
    };
    return {
      id: item.place_id,
      name: item.name,
      address: item.vicinity || 'Address not available',
      location: loc,
      rating: item.rating ?? null,
      userRatingCount: item.user_ratings_total ?? 0,
      isOpen: item.opening_hours?.open_now ?? null,
      distanceMeters: calculateDistanceMeters(origin, loc),
      types: item.types || [],
      googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`,
    };
  });

  normalized.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  placesCache.set(cacheKey, { data: normalized, expiresAt: Date.now() + CACHE_TTL_MS });
  return normalized;
}
