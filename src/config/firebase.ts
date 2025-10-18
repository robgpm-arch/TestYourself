import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'testyourself-dev.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'testyourself-dev',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'testyourself-dev.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456789012',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check with reCAPTCHA v3

const PLACEHOLDER_TOKEN_FRAGMENT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567';
export const isFirebaseConfigured = !firebaseConfig.apiKey?.includes(PLACEHOLDER_TOKEN_FRAGMENT);

if (!isFirebaseConfigured) {
  console.warn(
    'Firebase configuration is using placeholder credentials. Update VITE_FIREBASE_* env variables with real project values to enable authentication.'
  );
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (only in production and when measurement ID is available)
export const analytics =
  typeof window !== 'undefined' && import.meta.env.PROD && firebaseConfig.measurementId
    ? getAnalytics(app)
    : null;

// Messaging (for push notifications)
export const messaging =
  typeof window !== 'undefined' && 'serviceWorker' in navigator ? getMessaging(app) : null;

// Authentication providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// TEMP: so you can use it from DevTools
// Remove after debugging
(window as any).auth = auth;

// Configure Google provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Configure Facebook provider
facebookProvider.addScope('email');

// Push notification token helper
export const getMessagingToken = async (): Promise<string | null> => {
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    });
    return token;
  } catch (error) {
    console.error('Error getting messaging token:', error);
    return null;
  }
};

// Export the app instance
export default app;
