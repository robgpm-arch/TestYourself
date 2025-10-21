import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, getDb } from '@/lib/firebaseClient';
import { useNavigate } from 'react-router-dom';
import { navigateSafe } from '@/lib/nav';

export function useAuthRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    let unsub: any = null;
    let mounted = true;
    (async () => {
      try {
        const auth = await getAuth();
        const db = await getDb();
        if (!mounted) return;
        unsub = onAuthStateChanged(auth, async (user) => {
          try {
            if (!user) return;
            const snap = await getDoc(doc(db, 'profiles', user.uid));
            const profile = snap.exists() ? (snap.data() as { onboarded?: boolean }) : null;
            if (!profile?.onboarded) {
              navigateSafe(navigate, '/onboardingtutorials', { replace: true });
            } else {
              navigateSafe(navigate, '/home', { replace: true });
            }
          } catch {
            navigateSafe(navigate, '/onboardingtutorials', { replace: true });
          }
        });
      } catch {
        // ignore init errors — keep default behavior
      }
    })();

    return () => {
      mounted = false;
      try {
        unsub?.();
      } catch {}
    };
  }, [navigate]);
}
