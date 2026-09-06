import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Timestamp } from 'firebase-admin/firestore';
import { getEmergencyById, updateEmergencyStatus } from './emergencyService';
import { ERROR_CODES } from '../../shared/errors';

const mockEmergencyDocGet = vi.fn();
const mockEmergencyDocUpdate = vi.fn();

vi.mock('../../config/firebase', () => ({
  getFirestore: () => ({
    collection: () => ({
      doc: () => ({
        get: mockEmergencyDocGet,
        update: mockEmergencyDocUpdate,
      }),
    }),
  }),
}));

vi.mock('../maps/placesService', () => ({
  fetchPlacesFromGoogle: vi.fn().mockResolvedValue([]),
}));

describe('Emergency Service', () => {
  beforeEach(() => {
    mockEmergencyDocGet.mockReset();
    mockEmergencyDocUpdate.mockReset();
  });

  describe('getEmergencyById', () => {
    it('returns emergency record for owning user', async () => {
      mockEmergencyDocGet.mockResolvedValue({
        exists: true,
        id: 'emg-1',
        data: () => ({
          userId: 'user-a',
          petId: 'pet-1',
          latitude: 22.7196,
          longitude: 75.8577,
          description: 'Dog collapsed',
          urgency: 'EMERGENCY',
          status: 'OPEN',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }),
      });

      const res = await getEmergencyById('user-a', 'emg-1');
      expect(res.emergencyId).toBe('emg-1');
      expect(res.urgency).toBe('EMERGENCY');
    });

    it('rejects access from non-owning user', async () => {
      mockEmergencyDocGet.mockResolvedValue({
        exists: true,
        id: 'emg-1',
        data: () => ({
          userId: 'user-b',
          petId: 'pet-1',
          latitude: 22.7196,
          longitude: 75.8577,
          description: 'Dog collapsed',
          urgency: 'EMERGENCY',
          status: 'OPEN',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }),
      });

      await expect(getEmergencyById('user-a', 'emg-1')).rejects.toMatchObject({
        code: ERROR_CODES.FORBIDDEN,
      });
    });

    it('throws EMERGENCY_NOT_FOUND when record does not exist', async () => {
      mockEmergencyDocGet.mockResolvedValue({ exists: false });

      await expect(getEmergencyById('user-a', 'missing-id')).rejects.toMatchObject({
        code: ERROR_CODES.EMERGENCY_NOT_FOUND,
      });
    });
  });

  describe('updateEmergencyStatus', () => {
    it('rejects non-owner modifying status', async () => {
      mockEmergencyDocGet.mockResolvedValue({
        exists: true,
        id: 'emg-1',
        data: () => ({
          userId: 'user-b',
          petId: 'pet-1',
          status: 'OPEN',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }),
      });

      await expect(
        updateEmergencyStatus('user-a', 'emg-1', { status: 'RESOLVED' }),
      ).rejects.toMatchObject({
        code: ERROR_CODES.FORBIDDEN,
      });
    });
  });
});
