import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirestore } from '../config/firebase';
import { COLLECTIONS, SUBCOLLECTIONS } from '../config/constants';
import {
  AIConversationMessageRecord,
  AIConversationMessageResponse,
  AIConversationRecord,
  AIConversationResponse,
  AIHealthResponsePayload,
} from '../modules/ai/ai.types';
import { timestampToIso } from '../shared/utils/serialize';

function toConversationResponse(
  record: AIConversationRecord,
  messages?: AIConversationMessageResponse[],
): AIConversationResponse {
  return {
    id: record.id,
    userId: record.userId,
    petId: record.petId,
    status: record.status,
    createdAt: timestampToIso(record.createdAt as Timestamp)!,
    updatedAt: timestampToIso(record.updatedAt as Timestamp)!,
    ...(messages ? { messages } : {}),
  };
}

function toMessageResponse(record: AIConversationMessageRecord): AIConversationMessageResponse {
  return {
    id: record.id,
    conversationId: record.conversationId,
    role: record.role,
    content: record.content,
    urgency: record.urgency,
    structuredResponse: record.structuredResponse,
    createdAt: timestampToIso(record.createdAt as Timestamp)!,
  };
}

export async function findConversationById(
  conversationId: string,
): Promise<AIConversationRecord | null> {
  const doc = await getFirestore().collection(COLLECTIONS.AI_CONVERSATIONS).doc(conversationId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() } as AIConversationRecord;
}

export async function createConversation(
  userId: string,
  petId: string,
): Promise<AIConversationResponse> {
  const db = getFirestore();
  const docRef = db.collection(COLLECTIONS.AI_CONVERSATIONS).doc();
  const now = FieldValue.serverTimestamp();

  const record: Omit<AIConversationRecord, 'id'> = {
    userId,
    petId,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(record);
  const created = await docRef.get();
  return toConversationResponse({ id: created.id, ...created.data() } as AIConversationRecord);
}

export async function listConversationsForUser(
  userId: string,
  limitCount = 20,
): Promise<AIConversationResponse[]> {
  const snapshot = await getFirestore()
    .collection(COLLECTIONS.AI_CONVERSATIONS)
    .where('userId', '==', userId)
    .orderBy('updatedAt', 'desc')
    .limit(limitCount)
    .get();

  return snapshot.docs.map((doc) =>
    toConversationResponse({ id: doc.id, ...doc.data() } as AIConversationRecord),
  );
}

export async function addMessageToConversation(
  conversationId: string,
  message: {
    role: 'user' | 'assistant';
    content: string;
    urgency?: AIConversationMessageRecord['urgency'];
    structuredResponse?: AIHealthResponsePayload;
  },
): Promise<AIConversationMessageResponse> {
  const db = getFirestore();
  const convRef = db.collection(COLLECTIONS.AI_CONVERSATIONS).doc(conversationId);
  const msgRef = convRef.collection(SUBCOLLECTIONS.MESSAGES).doc();
  const now = FieldValue.serverTimestamp();

  await msgRef.set({
    conversationId,
    role: message.role,
    content: message.content,
    urgency: message.urgency ?? null,
    structuredResponse: message.structuredResponse ?? null,
    createdAt: now,
  });

  await convRef.update({
    updatedAt: now,
  });

  const created = await msgRef.get();
  return toMessageResponse({ id: created.id, ...created.data() } as AIConversationMessageRecord);
}

export async function getRecentMessages(
  conversationId: string,
  limitCount = 10,
): Promise<AIConversationMessageResponse[]> {
  const snapshot = await getFirestore()
    .collection(COLLECTIONS.AI_CONVERSATIONS)
    .doc(conversationId)
    .collection(SUBCOLLECTIONS.MESSAGES)
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get();

  const messages = snapshot.docs
    .map((doc) => toMessageResponse({ id: doc.id, ...doc.data() } as AIConversationMessageRecord))
    .reverse();

  return messages;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const db = getFirestore();
  const convRef = db.collection(COLLECTIONS.AI_CONVERSATIONS).doc(conversationId);

  // Delete messages in subcollection
  const messagesSnapshot = await convRef.collection(SUBCOLLECTIONS.MESSAGES).get();
  const batch = db.batch();
  for (const doc of messagesSnapshot.docs) {
    batch.delete(doc.ref);
  }
  batch.delete(convRef);
  await batch.commit();
}
