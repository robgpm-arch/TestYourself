import { doc, getDoc } from 'firebase/firestore';
import { getAuth, getDb } from '../lib/firebaseClient';

export async function getUserState() {
  const auth = await getAuth();
  const user = auth.currentUser;
  if (!user) return { signedIn: false };

  const { getIdTokenResult } = await import('firebase/auth');
  const token = await getIdTokenResult(user, true);
  const isAdmin = !!token.claims?.admin;

  const db = await getDb();
  const snap = await getDoc(doc(db, 'users', user.uid));
  const hasUserDoc = snap.exists();
  const onboarded = hasUserDoc && snap.data()?.onboarded === true;
  const courseChosen = !!snap.data()?.currentCourse;

  return { signedIn: true, isAdmin, hasUserDoc, onboarded, courseChosen };
}

// Central redirect logic
export async function routeForSplash(navigate: (path: string, options?: any) => void) {
  // Splash does not auto-redirect; just shows buttons.
}

export async function routeAfterLoginOrRegister(navigate: (path: string, options?: any) => void) {
  const s = await getUserState();
  if (!s.signedIn) return navigate('/login', { replace: true });
  if (!s.onboarded) return navigate('/onboardingtutorials', { replace: true });
  return navigate('/profile', { replace: true });
}

export async function guardAdmin(navigate: (path: string, options?: any) => void) {
  const s = await getUserState();
  if (!s.signedIn || !s.isAdmin) return navigate('/', { replace: true });
}

export async function guardApp(navigate: (path: string, options?: any) => void) {
  const s = await getUserState();
  if (!s.signedIn) return navigate('/login', { replace: true });
  if (!s.onboarded) return navigate('/onboardingtutorials', { replace: true });
  if (!s.courseChosen) return navigate('/change-course', { replace: true });
  // else allow
}
