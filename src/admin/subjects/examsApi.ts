import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { getDb } from '../../lib/firebaseClient';

export type Exam = {
  id: string;
  name: string;
  board?: string;
  courseId?: string;
  enabled?: boolean;
  order?: number;
};

export function listenExams(cb: (rows: Exam[]) => void) {
  let stop: any = null;
  (async () => {
    try {
      const db = await getDb();
      const q = query(collection(db, 'exams'), orderBy('order'));
      stop = onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));
    } catch (e) {
      console.error('listenExams failed', e);
      cb([]);
    }
  })();
  return () => stop?.();
}
