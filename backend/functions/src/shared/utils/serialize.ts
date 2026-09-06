import { Timestamp } from 'firebase-admin/firestore';

export function timestampToIso(value: Timestamp | undefined | null): string | null {
  if (!value) {
    return null;
  }
  return value.toDate().toISOString();
}

export function parseDateInput(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}
