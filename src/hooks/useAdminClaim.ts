import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { onIdTokenChanged, getIdTokenResult } from "firebase/auth";

export function useAdminClaim() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // listen to token changes (sign in/out, refresh)
    const unsub = onIdTokenChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // FORCE refresh once to pick up new custom claims
      const result = await getIdTokenResult(u, /*forceRefresh=*/ true);
      setIsAdmin(!!result.claims.admin);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, isAdmin, loading };
}