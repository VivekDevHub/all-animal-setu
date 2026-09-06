import { describe, it, expect } from 'vitest';
import { stripForbiddenPetFields } from './pet.service';

describe('stripForbiddenPetFields', () => {
  it('removes server-controlled fields from request body', () => {
    const cleaned = stripForbiddenPetFields({
      name: 'Bruno',
      ownerId: 'hacker-id',
      isActive: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    });

    expect(cleaned).toEqual({ name: 'Bruno' });
  });
});
