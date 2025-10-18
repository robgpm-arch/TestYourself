import { initializeApp, getApps, getApp, setLogLevel } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
  Firestore,
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// --- Firestore singleton ---
let _db: Firestore;
try {
  // Only the FIRST call in the whole app should reach here
  _db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    // experimentalForceLongPolling: true, // only if you actually need it
  });
} catch {
  // If some other module initialized with options already, reuse it
  _db = getFirestore(app);
}
export const db = _db;

export const auth = getAuth(app);

// Reduce SDK noise in production consoles
try {
  if (import.meta.env.PROD) setLogLevel('error');
} catch {}

// Authentication providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configure providers
googleProvider.addScope('profile');
googleProvider.addScope('email');
facebookProvider.addScope('email');
