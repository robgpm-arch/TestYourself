import { getInstallations, getId } from 'firebase/installations';
import { app } from '@/lib/firebase';

const FALLBACK_KEY = 'ty_device_id_v1';

export async function getDeviceId(): Promise<string> {
  try {
    const inst = getInstallations(app);
    const fid = await getId(inst); // stable per browser profile
    if (fid) return `fid:${fid}`;
  } catch {}
  // Fallback to localStorage UUID
  let id = localStorage.getItem(FALLBACK_KEY);
  if (!id) {
    const rnd = (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    id = rnd;
    localStorage.setItem(FALLBACK_KEY, id!);
  }
  return `ls:${id}`;
}