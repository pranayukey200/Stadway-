/**
 * Firebase client initialization for StandWay.
 *
 * SECURITY NOTES:
 * - Firebase API keys for Web clients are NOT secret credentials; they are safe to embed
 *   in client-side code. Access control is enforced exclusively via Firebase Security Rules
 *   (defined in firestore.rules) and Firebase Authentication.
 * - Sensitive server keys (e.g., GROQ_API_KEY) stay in Firebase Functions / server runtime
 *   and are never exposed to the browser.
 * - All Firestore reads/writes go through validated Security Rules to prevent unauthorized access.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  // VITE_FIREBASE_API_KEY is the recommended way to supply this in a real deployment.
  // A mock fallback is used for the hackathon prototype build.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'mock-api-key-for-stadium-prototype',
  authDomain: 'smarstadiumstournament.firebaseapp.com',
  projectId: 'smarstadiumstournament',
  storageBucket: 'smarstadiumstournament.appspot.com',
  messagingSenderId: '60619165507',
  appId: '1:60619165507:web:mockappid'
};

const app = initializeApp(firebaseConfig);

/** Firestore database instance — real-time venue state and volunteer task data */
const db = getFirestore(app);

/** Firebase Functions instance — used for cloud orchestrator calls in production */
const functions = getFunctions(app);

// Connect to Firebase local emulators when running on localhost (dev / CI environment)
if (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
) {
  console.log('[StandWay] Connecting to Firebase emulators on localhost...');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

export { app, db, functions };
