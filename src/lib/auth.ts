import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  getIdToken,
  getIdTokenResult,
  User
} from "firebase/auth";
import { app } from './firebase';

export const auth = getAuth(app);

// Promise that resolves when Firebase has restored the session
export const authReady = (async () => {
  await setPersistence(auth, browserLocalPersistence);
  return new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u);
    });
  });
})();