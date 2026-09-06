import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateDistanceMeters,
  clearPlacesCacheForTests,
  fetchPlacesFromGoogle,
  getKeywordsForType,
} from './placesService';
import { ERROR_CODES } from '../../shared/errors';

describe('Places Service', () => {
  beforeEach(() => {
    clearPlacesCacheForTests();
  });

  describe('calculateDistanceMeters', () => {
    it('calculates distance between two known coordinates accurately', () => {
      // Mumbai (19.0760, 72.8777) to Pune (18.5204, 73.8567) is ~120 km (118,000 - 125,000m)
      const loc1 = { lat: 19.076, lng: 72.8777 };
      const loc2 = { lat: 18.5204, lng: 73.8567 };

      const distance = calculateDistanceMeters(loc1, loc2);
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(130000);
    });

    it('returns 0 for identical coordinates', () => {
      const loc = { lat: 28.6139, lng: 77.209 };
      expect(calculateDistanceMeters(loc, loc)).toBe(0);
    });
  });

  describe('getKeywordsForType', () => {
    it('returns 24 hour emergency keywords for EMERGENCY type', () => {
      const result = getKeywordsForType('EMERGENCY');
      expect(result.queryKeyword).toContain('emergency');
      expect(result.includedTypes).toContain('hospital');
    });

    it('returns veterinary clinic keyword for VET type', () => {
      const result = getKeywordsForType('VET');
      expect(result.queryKeyword).toContain('clinic');
    });
  });

  describe('fetchPlacesFromGoogle error handling', () => {
    it('throws PLACES_SERVICE_UNAVAILABLE when API keys are not configured', async () => {
      // In test setup, GOOGLE_PLACES_API_KEY is not set
      await expect(fetchPlacesFromGoogle(22.7196, 75.8577, 5000, 'VET')).rejects.toMatchObject({
        code: ERROR_CODES.PLACES_SERVICE_UNAVAILABLE,
      });
    });
  });
});
