import { describe, it, expect } from 'vitest';
import { createPetSchema, updatePetSchema } from './pet.schema';

describe('createPetSchema', () => {
  it('accepts valid pet input', () => {
    const result = createPetSchema.parse({
      name: 'Bruno',
      species: 'Dog',
      breed: 'Golden Retriever',
      gender: 'Male',
      dateOfBirth: '2022-05-10',
      weight: 24.5,
      weightUnit: 'kg',
      allergies: ['Chicken'],
      medicalConditions: [],
    });

    expect(result.name).toBe('Bruno');
    expect(result.species).toBe('Dog');
  });

  it('rejects empty name', () => {
    expect(() =>
      createPetSchema.parse({
        name: '',
        species: 'Dog',
      }),
    ).toThrow();
  });

  it('rejects negative weight', () => {
    expect(() =>
      createPetSchema.parse({
        name: 'Bruno',
        species: 'Dog',
        weight: -1,
      }),
    ).toThrow();
  });

  it('rejects unsupported species', () => {
    expect(() =>
      createPetSchema.parse({
        name: 'Bruno',
        species: 'Dragon',
      }),
    ).toThrow();
  });

  it('rejects ownerId from client', () => {
    expect(() =>
      createPetSchema.parse({
        name: 'Bruno',
        species: 'Dog',
        ownerId: 'other-user',
      }),
    ).toThrow();
  });
});

describe('updatePetSchema', () => {
  it('requires at least one field', () => {
    expect(() => updatePetSchema.parse({})).toThrow();
  });

  it('rejects ownerId updates', () => {
    expect(() =>
      updatePetSchema.parse({
        ownerId: 'other-user',
        name: 'Bruno',
      }),
    ).toThrow();
  });
});
