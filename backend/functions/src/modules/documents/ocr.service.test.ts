import { describe, it, expect } from 'vitest';
import { parseMedicalText } from './ocr.service';

describe('parseMedicalText', () => {
  it('extracts vaccination fields from OCR text', () => {
    const rawText = `
      Vaccine: Rabies
      Date Given: 2026-01-15
      Next Due: 2027-01-15
      Vet: Dr. Sharma
      Clinic: Happy Paws
    `;

    const extracted = parseMedicalText(rawText);

    expect(extracted.vaccineName).toBeTruthy();
    expect(extracted.dateGiven).toBe('2026-01-15');
    expect(extracted.nextDueDate).toBe('2027-01-15');
    expect(extracted.vetName).toBeTruthy();
    expect(extracted.clinicName).toBeTruthy();
  });

  it('returns empty object for unparseable text', () => {
    expect(parseMedicalText('')).toEqual({});
  });
});
