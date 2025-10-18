import { useEffect, useState } from 'react';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { auth } from '../config/firebase';

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return setIsAdmin(false);
      try {
        const t = await getIdTokenResult(user, true); // refresh claims
        setIsAdmin(!!t.claims.admin);
      } catch {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  return isAdmin; // null = loading, true/false = decided
}