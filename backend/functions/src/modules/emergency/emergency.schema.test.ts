import { describe, it, expect } from 'vitest';
import {
  createEmergencySchema,
  emergencyIdParamSchema,
  updateEmergencyStatusSchema,
} from './emergency.schema';

describe('Emergency schemas', () => {
  it('accepts valid emergency creation input', () => {
    const parsed = createEmergencySchema.parse({
      petId: 'pet-123',
      latitude: 22.7196,
      longitude: 75.8577,
      description: 'Pet collapsed and cannot stand up.',
    });

    expect(parsed.petId).toBe('pet-123');
    expect(parsed.description).toContain('collapsed');
  });

  it('rejects missing or empty description', () => {
    expect(() =>
      createEmergencySchema.parse({
        petId: 'pet-123',
        latitude: 22.7196,
        longitude: 75.8577,
        description: '',
      }),
    ).toThrow();
  });

  it('rejects invalid coordinates', () => {
    expect(() =>
      createEmergencySchema.parse({
        petId: 'pet-123',
        latitude: 100,
        longitude: 75,
        description: 'Emergency',
      }),
    ).toThrow();
  });

  it('validates emergency status updates', () => {
    const valid = updateEmergencyStatusSchema.parse({
      status: 'RESOLVED',
      resolutionNotes: 'Treated at emergency clinic, vitals stable.',
    });
    expect(valid.status).toBe('RESOLVED');

    expect(() =>
      updateEmergencyStatusSchema.parse({
        status: 'UNKNOWN_STATUS',
      }),
    ).toThrow();
  });

  it('validates emergencyId param', () => {
    const parsed = emergencyIdParamSchema.parse({ emergencyId: 'emg-1' });
    expect(parsed.emergencyId).toBe('emg-1');

    expect(() => emergencyIdParamSchema.parse({ emergencyId: '' })).toThrow();
  });
});
