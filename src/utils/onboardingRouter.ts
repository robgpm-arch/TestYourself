import { NavigateFunction } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from '@/lib/firebaseClient';
import { getDb } from '@/lib/firebaseClient';

// Route users based on their onboarding status.
// - If the user document has onboarded: true -> go to profile
// - Otherwise -> go to onboarding
export const navigateAfterAuth = async (navigate: NavigateFunction) => {
  try {
    const auth = await getAuth();
    const user = auth.currentUser;
    if (!user) return navigate('/login', { replace: true });

    const db = await getDb();
    const snap = await getDoc(doc(db, 'users', user.uid));
    const onboarded = snap.exists() && snap.data()?.onboarded === true;
    navigate(onboarded ? '/profile' : '/onboardingtutorials', { replace: true });
  } catch {
    // Safe fallback
    navigate('/onboardingtutorials', { replace: true });
  }
};
