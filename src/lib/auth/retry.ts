import { getAuth, User } from 'firebase/auth';

export type BackoffOptions = {
  maxAttempts?: number; // including first attempt
  baseDelayMs?: number; // base for exponential backoff
  jitter?: number; // 0..1 jitter factor
  onBeforeRetry?: (attempt: number, err: unknown) => Promise<void> | void;
};

export function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export function isAuthExpiryError(err: any): boolean {
  const code = err?.code || err?.error?.message || '';
  const msg = String(code || err?.message || '').toUpperCase();
  return (
    msg.includes('AUTH/USER-TOKEN-EXPIRED') ||
    msg.includes('ID-TOKEN-EXPIRED') ||
    msg.includes('TOKEN_EXPIRED') ||
    msg.includes('INVALID_ID_TOKEN') ||
    msg.includes('CREDENTIAL_TOO_OLD_LOGIN_AGAIN') ||
    msg.includes('UNAUTHENTICATED') ||
    err?.status === 401
  );
}

export async function withBackoff<T>(fn: () => Promise<T>, opts: BackoffOptions = {}): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 5;
  const base = opts.baseDelayMs ?? 200;
  const jitter = opts.jitter ?? 0.25;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (opts.onBeforeRetry) {
        await opts.onBeforeRetry(attempt, err);
      }
      if (attempt >= maxAttempts) break;

      const expo = base * Math.pow(2, attempt - 1);
      const delta = expo * jitter * (Math.random() * 2 - 1);
      const delay = Math.max(0, Math.round(expo + delta));
      await sleep(delay);
    }
  }
  throw lastErr;
}

export async function refreshIfExpired(err: unknown) {
  if (!isAuthExpiryError(err)) return;
  try {
    const auth = getAuth();
    const user: User | null = auth.currentUser;
    if (user) {
      try {
        await user.getIdToken(true);
      } catch {}
      try {
        await (user as any).reload?.();
      } catch {}
    }
  } catch {}
}

