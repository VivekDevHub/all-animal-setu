import { Timestamp } from 'firebase-admin/firestore';
import { ReminderStatus, ReminderType } from '../../config/constants';

export interface ReminderRecord {
  id?: string;
  userId: string;
  petId: string;
  type: ReminderType | string;
  title: string;
  description: string;
  scheduledAt: Timestamp;
  status: ReminderStatus | string;
  notificationSent: boolean;
  sourceType: string;
  sourceId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReminderResponse {
  id: string;
  userId: string;
  petId: string;
  type: string;
  title: string;
  description: string;
  scheduledAt: string;
  status: string;
  notificationSent: boolean;
  sourceType: string;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderInput {
  petId: string;
  type: string;
  title: string;
  description?: string;
  scheduledAt: string;
}

export interface UpdateReminderInput {
  title?: string;
  description?: string;
  scheduledAt?: string;
  status?: string;
}

export interface UpsertSourceReminderInput {
  userId: string;
  petId: string;
  type: ReminderType | string;
  sourceType: string;
  sourceId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
}
