import { describe, it, expect } from 'vitest';
import {
  aiBreedIdentificationResponseSchema,
  aiDietPlanResponseSchema,
  aiExercisePlanResponseSchema,
  aiHealthResponseSchema,
  breedIdentificationInputSchema,
  healthAssistantInputSchema,
} from './ai.schema';
import { HEALTH_DISCLAIMER } from '../../config/constants';

describe('AI schemas', () => {
  describe('healthAssistantInputSchema', () => {
    it('accepts valid health assistant input', () => {
      const parsed = healthAssistantInputSchema.parse({
        petId: 'pet-123',
        message: 'My dog has vomited twice today.',
      });
      expect(parsed.petId).toBe('pet-123');
      expect(parsed.message).toBe('My dog has vomited twice today.');
    });

    it('rejects empty message or missing petId', () => {
      expect(() => healthAssistantInputSchema.parse({ petId: '', message: 'Hi' })).toThrow();
      expect(() => healthAssistantInputSchema.parse({ petId: 'pet-1', message: '   ' })).toThrow();
    });
  });

  describe('breedIdentificationInputSchema', () => {
    it('accepts valid secure storage path', () => {
      const parsed = breedIdentificationInputSchema.parse({
        petId: 'pet-123',
        imagePath: 'users/uid1/pets/pet-123/ai/breed/photo.jpg',
      });
      expect(parsed.imagePath).toContain('users/');
    });

    it('rejects non-secure or public image path', () => {
      expect(() =>
        breedIdentificationInputSchema.parse({
          petId: 'pet-123',
          imagePath: 'https://example.com/dog.jpg',
        }),
      ).toThrow();
    });
  });

  describe('aiHealthResponseSchema', () => {
    it('validates a correct structured AI response', () => {
      const valid = {
        urgency: 'MODERATE',
        summary: 'Pet exhibits mild gastrointestinal symptoms.',
        possibleConcerns: ['Dietary indiscretion', 'Mild gastritis'],
        recommendedActions: ['Withhold treats for 6 hours', 'Ensure fresh water is available'],
        warningSigns: ['Lethargy', 'Repeated vomiting within hours', 'Pale gums'],
        recommendedProfessionalCare: false,
        shouldFindNearbyVet: false,
        disclaimer: HEALTH_DISCLAIMER,
      };

      const parsed = aiHealthResponseSchema.parse(valid);
      expect(parsed.urgency).toBe('MODERATE');
      expect(parsed.possibleConcerns).toHaveLength(2);
    });

    it('rejects invalid urgency level', () => {
      const invalid = {
        urgency: 'VERY_HIGH',
        summary: 'Pet is sick',
        possibleConcerns: [],
        recommendedActions: [],
        warningSigns: [],
        recommendedProfessionalCare: true,
        shouldFindNearbyVet: true,
        disclaimer: HEALTH_DISCLAIMER,
      };

      expect(() => aiHealthResponseSchema.parse(invalid)).toThrow();
    });
  });

  describe('aiDietPlanResponseSchema', () => {
    it('validates a complete diet plan output', () => {
      const plan = {
        summary: 'Balanced adult canine maintenance diet',
        feedingSchedule: [
          { timeOfDay: 'Morning', portion: '1.5 cups', notes: 'Serve with fresh water' },
          { timeOfDay: 'Evening', portion: '1.5 cups' },
        ],
        generalFoodGuidelines: ['High-protein animal meal', 'Avoid table scraps'],
        foodsToAvoid: ['Chocolate', 'Onions', 'Grapes'],
        hydrationTips: ['Always keep fresh bowl filled'],
        professionalReviewRecommended: true,
      };

      const parsed = aiDietPlanResponseSchema.parse(plan);
      expect(parsed.feedingSchedule).toHaveLength(2);
      expect(parsed.professionalReviewRecommended).toBe(true);
    });
  });

  describe('aiExercisePlanResponseSchema', () => {
    it('validates exercise plan structure', () => {
      const exercise = {
        summary: 'Moderate low-impact daily routine for adult Labrador',
        dailyActivityRecommendations: [
          { activity: 'Neighborhood walk', durationMinutes: 30, intensity: 'MODERATE' },
        ],
        weeklyFrequency: 'Daily (7 days/week)',
        enrichmentActivities: ['Puzzle toys', 'Scent work'],
        restGuidance: ['Ensure shaded resting area after activity'],
        precautions: ['Avoid midday heat above 32C'],
        professionalReviewRecommended: false,
      };

      const parsed = aiExercisePlanResponseSchema.parse(exercise);
      expect(parsed.dailyActivityRecommendations[0].intensity).toBe('MODERATE');
    });
  });

  describe('aiBreedIdentificationResponseSchema', () => {
    it('validates breed identification result', () => {
      const breed = {
        species: 'Dog',
        primaryBreed: 'Golden Retriever',
        alternativeBreeds: ['Labrador Retriever'],
        confidence: 0.88,
        notes: 'Distinct golden coat and floppy ears.',
        disclaimer: 'Visual estimate only.',
      };

      const parsed = aiBreedIdentificationResponseSchema.parse(breed);
      expect(parsed.confidence).toBe(0.88);
      expect(parsed.primaryBreed).toBe('Golden Retriever');
    });
  });
});
