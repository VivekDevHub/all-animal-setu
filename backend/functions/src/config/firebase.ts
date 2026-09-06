import * as admin from 'firebase-admin';
import { getEnv } from './env';

let initialized = false;

export function initializeFirebase(): admin.app.App {
  if (initialized && admin.apps.length > 0) {
    return admin.app();
  }

  const env = getEnv();

  if (admin.apps.length === 0) {
    const credential =
      env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY
        ? admin.credential.cert({
            projectId: env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: env.FIREBASE_PRIVATE_KEY,
          })
        : admin.credential.applicationDefault();

    admin.initializeApp({
      credential,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.STORAGE_BUCKET,
    });
  }

  initialized = true;
  return admin.app();
}

export function getAuth(): admin.auth.Auth {
  initializeFirebase();
  return admin.auth();
}

export function getFirestore(): admin.firestore.Firestore {
  initializeFirebase();
  return admin.firestore();
}

export function getStorage(): admin.storage.Storage {
  initializeFirebase();
  return admin.storage();
}

export function getStorageBucket(): ReturnType<admin.storage.Storage['bucket']> {
  const env = getEnv();
  const storage = getStorage();
  return env.STORAGE_BUCKET ? storage.bucket(env.STORAGE_BUCKET) : storage.bucket();
}

export function resetFirebaseForTests(): void {
  initialized = false;
  for (const app of admin.apps) {
    if (app) {
      void app.delete();
    }
  }
}
