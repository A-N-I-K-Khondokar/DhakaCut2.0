import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'mock-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mock-domain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mock-bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'mock-sender',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'mock-app',
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Use memory cache to avoid IndexedDB quota errors.
// Do NOT use experimentalForceLongPolling in production — it disables WebSocket
// connections and degrades performance significantly (causes 2–5s extra latency).
const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});

export { app, auth, db };
