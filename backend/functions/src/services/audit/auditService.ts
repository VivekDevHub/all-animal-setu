import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '../../config/firebase';
import { COLLECTIONS } from '../../config/constants';
import { logger } from '../../shared/logger/logger';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(entry: AuditLogEntry): Promise<string> {
  try {
    const db = getFirestore();
    const docRef = db.collection(COLLECTIONS.AUDIT_LOGS).doc();

    const sanitizedMetadata: Record<string, unknown> = {};
    if (entry.metadata) {
      for (const [key, value] of Object.entries(entry.metadata)) {
        // Strip sensitive fields
        if (!['token', 'password', 'key', 'secret', 'medicalNotes', 'prompt'].includes(key)) {
          sanitizedMetadata[key] = value;
        }
      }
    }

    await docRef.set({
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      metadata: sanitizedMetadata,
      createdAt: FieldValue.serverTimestamp(),
    });

    logger.info('audit_log_created', {
      auditLogId: docRef.id,
      action: entry.action,
      userId: entry.userId,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
    });

    return docRef.id;
  } catch (error) {
    logger.warn('audit_log_failed', {
      action: entry.action,
      error: error instanceof Error ? error.message : String(error),
    });
    return '';
  }
}
