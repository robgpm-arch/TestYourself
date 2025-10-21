import { getDb } from '@/lib/firebaseClient';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';

export type Board = {
  id: string;
  name: string;
  medium?: string;
  order?: number;
  enabled?: boolean;
};

export function listenBoardsForMedium(
  medium: string,
  cb: (rows: Board[]) => void,
  onErr?: (e: any) => void
) {
  if (!medium) {
    cb([]);
    return () => {};
  }

  let realUnsub: (() => void) | null = null;
  let cancelled = false;

  (async () => {
    try {
      const db = await getDb();
      if (cancelled) return;
      const q = query(collection(db, 'boards'), where('mediumId', '==', medium), orderBy('order'));
      realUnsub = onSnapshot(
        q,
        (snap: any) => cb(snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }))),
        (err: any) => {
          console.error('[boards] query error:', err);
          onErr?.(err);
          cb([]);
        }
      );
    } catch (e) {
      // ignore
      onErr?.(e);
    }
  })();

  return () => {
    cancelled = true;
    try {
      realUnsub?.();
    } catch {}
  };
}
