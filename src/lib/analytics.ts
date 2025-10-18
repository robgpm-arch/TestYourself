import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';
import { app } from './firebase';

export const analyticsPromise = isSupported().then(s => (s ? getAnalytics(app) : null));

export async function event(name: string, params: Record<string, any>) {
  const an = await analyticsPromise;
  if (!an) return;
  logEvent(an, name as any, params);
}
