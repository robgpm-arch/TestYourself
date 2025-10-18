import { useEffect, useState } from "react";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const [state, setState] = useState<"loading"|"ok"|"deny">("loading");
  useEffect(() => {
    const auth = getAuth();
    return onIdTokenChanged(auth, async (user) => {
      if (!user) return setState("deny");
      await user.getIdToken(true);
      const tr = await user.getIdTokenResult();
      setState(tr.claims.admin ? "ok" : "deny");
    });
  }, []);
  if (state === "loading") return <div className="p-6">Checking admin…</div>;
  if (state === "deny")    return <Navigate to="/" replace />;
  return children;
}