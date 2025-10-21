let _app: any = null;
let _db: any = null;
let _auth: any = null;

export async function initFirebase() {
  if (_app) return { app: _app, db: _db, auth: _auth };
  const { initializeApp, getApps, getApp, setLogLevel } = await import('firebase/app');
  const firestore = await import('firebase/firestore');
  const authMod = await import('firebase/auth');

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  try {
    _db = firestore.getFirestore(_app);
  } catch {
    _db = firestore.getFirestore(_app);
  }

  _auth = authMod.getAuth(_app);

  try {
    if (import.meta.env.PROD) setLogLevel('error');
  } catch {}

  return { app: _app, db: _db, auth: _auth };
}

export async function getDb() {
  if (!_db) await initFirebase();
  return _db;
}

export async function getAuth() {
  if (!_auth) await initFirebase();
  return _auth;
}

export function hasInitialized() {
  return !!_app;
}

export async function getApp() {
  if (!_app) await initFirebase();
  return _app;
}
