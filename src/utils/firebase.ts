import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// These can be overridden by environment variables if desired,
// but for the hackathon prototype, a default mock config is perfect.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key-for-stadium",
  authDomain: "smarstadiumstournament.firebaseapp.com",
  projectId: "smarstadiumstournament",
  storageBucket: "smarstadiumstournament.appspot.com",
  messagingSenderId: "60619165507",
  appId: "1:60619165507:web:mockappid"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Connect to emulators if in dev mode
// We check if it is running on localhost or via import.meta.env.DEV
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  console.log('Connecting to Firebase emulators...');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

export { app, db, auth, functions };
