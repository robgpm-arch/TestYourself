import { db } from '@/lib/firebase';
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
  return onSnapshot(query(collection(db, 'exams'), orderBy('order')), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
  );
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

  const q = query(collection(db, 'exams'), where('mediumId', '==', medium), orderBy('order'));
  return onSnapshot(
    q,
    snap => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))),
    err => {
      console.error('[exams] query error:', err);
      onErr?.(err);
      cb([]);
    }
  );
}
