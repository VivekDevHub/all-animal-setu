import { describe, it, expect } from 'vitest';
import { nearbyVetsQuerySchema } from './vet.schema';

describe('nearbyVetsQuerySchema', () => {
  it('accepts valid coordinates and defaults', () => {
    const parsed = nearbyVetsQuerySchema.parse({
      lat: 22.7196,
      lng: 75.8577,
    });

    expect(parsed.lat).toBe(22.7196);
    expect(parsed.lng).toBe(75.8577);
    expect(parsed.radius).toBe(5000);
    expect(parsed.type).toBe('VET');
  });

  it('accepts valid explicit parameters', () => {
    const parsed = nearbyVetsQuerySchema.parse({
      lat: '19.0760',
      lng: '72.8777',
      radius: '10000',
      type: 'EMERGENCY',
    });

    expect(parsed.lat).toBe(19.076);
    expect(parsed.lng).toBe(72.8777);
    expect(parsed.radius).toBe(10000);
    expect(parsed.type).toBe('EMERGENCY');
  });

  it('rejects latitude out of bounds', () => {
    expect(() =>
      nearbyVetsQuerySchema.parse({
        lat: 95,
        lng: 75,
      }),
    ).toThrow(/Latitude must be <= 90/);

    expect(() =>
      nearbyVetsQuerySchema.parse({
        lat: -95,
        lng: 75,
      }),
    ).toThrow(/Latitude must be >= -90/);
  });

  it('rejects longitude out of bounds', () => {
    expect(() =>
      nearbyVetsQuerySchema.parse({
        lat: 20,
        lng: 190,
      }),
    ).toThrow(/Longitude must be <= 180/);
  });

  it('rejects excessive radius > 50,000 meters', () => {
    expect(() =>
      nearbyVetsQuerySchema.parse({
        lat: 20,
        lng: 75,
        radius: 60000,
      }),
    ).toThrow(/Radius cannot exceed 50000 meters/);
  });

  it('rejects invalid search type', () => {
    expect(() =>
      nearbyVetsQuerySchema.parse({
        lat: 20,
        lng: 75,
        type: 'SUPERMARKET',
      }),
    ).toThrow();
  });
});
