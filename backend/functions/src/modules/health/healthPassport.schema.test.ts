import { describe, it, expect } from 'vitest';
import { upsertHealthPassportSchema } from './healthPassport.schema';

describe('upsertHealthPassportSchema', () => {
  it('accepts valid health passport input', () => {
    const result = upsertHealthPassportSchema.parse({
      bloodType: 'DEA 1.1+',
      allergies: ['Chicken'],
      medicalConditions: ['Sensitive stomach'],
      emergencyContact: { name: 'Vivek', phone: '+919999999999' },
      notes: 'Keep hydrated',
    });

    expect(result.bloodType).toBe('DEA 1.1+');
    expect(result.allergies).toEqual(['Chicken']);
  });

  it('rejects ownerId from client', () => {
    expect(() =>
      upsertHealthPassportSchema.parse({
        ownerId: 'other-user',
        notes: 'test',
      }),
    ).toThrow();
  });
});
