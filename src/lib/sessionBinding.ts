// SDK-only session binding: no direct calls to securetoken/identitytoolkit
import { getAuth, onIdTokenChanged, Unsubscribe } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDeviceId } from '@/utils/deviceId';

/**
 * Best-effort device binding via callable "bindDevice".
 * - Always rely on Firebase SDK to mint/refresh tokens.
 * - Never fetch securetoken or identitytoolkit directly.
 */
export async function bindActiveDevice(): Promise<void> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;
  // Refresh token with a small resilience loop: reload -> retry once.
  const refreshIdToken = async () => {
    try {
      await user.getIdToken(true);
      return;
    } catch (e: any) {
      if (e?.code === 'auth/user-token-expired' || e?.code === 'auth/id-token-expired') {
        try {
          await user.reload();
          await new Promise(r => setTimeout(r, 250));
          await user.getIdToken(true);
          return;
        } catch (e2) {
          throw e2;
        }
      }
      throw e;
    }
  };

  try {
    await refreshIdToken();
    const deviceId = await getDeviceId();
    const fn = httpsCallable(getFunctions(), 'bindDevice');
    try {
      await fn({ deviceId });
    } catch (callErr: any) {
      // Retry once if auth has just rotated and callable sees stale auth
      if (
        callErr?.code === 'functions/unauthenticated' ||
        callErr?.message?.includes('Unauthenticated')
      ) {
        await refreshIdToken();
        await fn({ deviceId });
      } else {
        throw callErr;
      }
    }
    // Pull updated custom claims (e.g., deviceId)
    await refreshIdToken();
  } catch (err) {
    console.warn('bindActiveDevice() best-effort error:', err);
  }
}

/**
 * Subscribe to custom-claim changes (deviceId, etc.) without manual REST.
 */
/**
 * Subscribe to deviceId (custom claim) changes.
 * - Defensive: cb is optional and type-checked at call-time.
 * - Always return an Unsubscribe no-op even if auth not ready.
 */
export function watchDeviceClaim(cb?: (deviceId?: string) => void): Unsubscribe {
  const auth = getAuth();
  const safeCall = (val?: string) => {
    if (typeof cb === 'function') {
      try {
        cb(val);
      } catch (err) {
        console.warn('watchDeviceClaim cb error:', err);
      }
    }
  };
  try {
    return onIdTokenChanged(auth, async u => {
      if (!u) return safeCall(undefined);
      try {
        const res = await u.getIdTokenResult();
        safeCall((res.claims as any)?.deviceId as string | undefined);
      } catch (e) {
        console.warn('watchDeviceClaim token read failed:', e);
        safeCall(undefined);
      }
    });
  } catch {
    // Fallback no-op unsubscribe if something throws before listener is attached
    return () => {};
  }
}
