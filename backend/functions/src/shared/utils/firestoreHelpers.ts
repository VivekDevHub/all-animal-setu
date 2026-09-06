import { Timestamp } from 'firebase-admin/firestore';

export function serializeTimestamps<T extends Record<string, unknown>>(
  data: T,
  fields: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };
  for (const field of fields) {
    const value = result[field];
    if (value instanceof Timestamp) {
      result[field] = value.toDate().toISOString();
    } else if (value === null || value === undefined) {
      result[field] = null;
    }
  }
  return result;
}

export function toTimestamp(value: string | Date | undefined | null): Timestamp | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return Timestamp.fromDate(date);
}
