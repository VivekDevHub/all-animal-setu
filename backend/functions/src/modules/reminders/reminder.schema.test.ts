import { describe, it, expect } from 'vitest';
import { buildSourceReminderId } from './reminder.schema';

describe('reminder schema helpers', () => {
  it('builds deterministic source reminder ids', () => {
    expect(buildSourceReminderId('VACCINATION', 'vac-123')).toBe('VACCINATION_vac-123');
    expect(buildSourceReminderId('MEDICATION', 'med-456')).toBe('MEDICATION_med-456');
  });
});
