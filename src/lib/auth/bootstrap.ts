import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { assertAuthorizedDomain } from "./guards";

/** Persist session and validate domain once on load. */
export function bootstrapAuth() {
  try {
    const auth = getAuth();
    setPersistence(auth, browserLocalPersistence).catch((e) => {
      // eslint-disable-next-line no-console
      console.warn("[Auth] setPersistence failed (using default):", e);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[Auth] getAuth()/setPersistence unavailable yet:", e);
  }

  if (typeof window !== "undefined") {
    try { assertAuthorizedDomain(window.location.host); } catch {}
  }
}

// Auto-run on import
try { bootstrapAuth(); } catch {}
