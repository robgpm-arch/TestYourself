import { getDb } from '@/lib/firebaseClient';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';

export type Exam = {
  id: string;
  name: string;
  medium?: string;
  board?: string;
  order?: number;
  enabled?: boolean;
};

export function listenExams(cb: (rows: Exam[]) => void) {
  let realUnsub: (() => void) | null = null;
  (async () => {
    try {
      const db = await getDb();
      realUnsub = onSnapshot(query(collection(db, 'exams'), orderBy('order')), (snap: any) =>
        cb(snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) })))
      );
    } catch {
      // swallow
    }
  })();
  return () => { try { realUnsub?.(); } catch {} };
}

export function listenExamsForMedium(
  medium: string,
  cb: (rows: Exam[]) => void,
  onErr?: (e: any) => void
) {
  if (!medium) {
    cb([]);
    return () => {};
  }

  let realUnsub: (() => void) | null = null;
  (async () => {
    try {
      const db = await getDb();
      const q = query(collection(db, 'exams'), where('mediumId', '==', medium), orderBy('order'));
      realUnsub = onSnapshot(
        q,
        (snap: any) => cb(snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }))),
        (err: any) => {
          console.error('[exams] query error:', err);
          onErr?.(err);
          cb([]);
        }
      );
    } catch (e) {
      onErr?.(e);
    }
  })();
  return () => { try { realUnsub?.(); } catch {} };
}
