import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractJsonFromResponse } from './geminiClient';
import { isDeterministicEmergency } from './healthAssistantService';
import { AppError, ERROR_CODES } from '../../shared/errors';

describe('AI Services', () => {
  describe('Deterministic Emergency Detection', () => {
    it('detects breathing difficulty as emergency', () => {
      expect(isDeterministicEmergency('My cat is having difficulty breathing')).toBe(true);
      expect(isDeterministicEmergency('Cat cannot breathe well')).toBe(true);
    });

    it('detects unconsciousness or collapse as emergency', () => {
      expect(isDeterministicEmergency('The dog is unconscious on the floor')).toBe(true);
      expect(isDeterministicEmergency('Pet collapsed suddenly')).toBe(true);
      expect(isDeterministicEmergency('My puppy cannot stand')).toBe(true);
    });

    it('detects seizures and severe bleeding as emergency', () => {
      expect(isDeterministicEmergency('Dog having a severe seizure')).toBe(true);
      expect(isDeterministicEmergency('Heavy bleeding from leg wound')).toBe(true);
      expect(isDeterministicEmergency('Ate toxic rat poison')).toBe(true);
    });

    it('returns false for non-emergency educational queries', () => {
      expect(isDeterministicEmergency('What is the best shampoo for golden retrievers?')).toBe(
        false,
      );
      expect(isDeterministicEmergency('My cat sneezed once after smelling pepper.')).toBe(false);
      expect(isDeterministicEmergency('Dog seems slightly sleepy today.')).toBe(false);
    });
  });

  describe('extractJsonFromResponse', () => {
    it('parses pure JSON string', () => {
      const raw = '{"urgency": "LOW", "summary": "All good"}';
      const parsed = extractJsonFromResponse(raw) as { urgency: string };
      expect(parsed.urgency).toBe('LOW');
    });

    it('parses markdown-fenced ```json ... ``` content', () => {
      const raw = '```json\n{\n  "urgency": "MODERATE",\n  "summary": "Check ear"\n}\n```';
      const parsed = extractJsonFromResponse(raw) as { urgency: string };
      expect(parsed.urgency).toBe('MODERATE');
    });

    it('throws AI_INVALID_RESPONSE for malformed JSON', () => {
      const malformed = 'Sorry, as an AI model I cannot diagnose: { not json';
      expect(() => extractJsonFromResponse(malformed)).toThrowError();
      try {
        extractJsonFromResponse(malformed);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.AI_INVALID_RESPONSE);
      }
    });
  });
});
