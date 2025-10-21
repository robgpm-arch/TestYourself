import * as React from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getDb } from '@/lib/firebaseClient';

export type Exam = { id: string; name: string; medium?: string; order?: number; enabled?: boolean };

export function useExamsByMedium(medium?: string) {
  const [rows, setRows] = React.useState<Exam[]>([]);
  React.useEffect(() => {
    if (!medium) {
      setRows([]);
      return;
    }

    let stop: any = null;
    (async () => {
      try {
        const db = await getDb();
        const q = query(collection(db, 'exams'), where('medium', '==', medium), orderBy('order'));
        stop = onSnapshot(
          q,
          s => setRows(s.docs.map(d => ({ id: d.id, ...(d.data() as any) }))),
          e => {
            console.error('[exams] load failed:', e);
            setRows([]);
          }
        );
      } catch (e) {
        console.error('[exams] query build failed:', e);
        setRows([]);
      }
    })();

    return () => stop?.();
  }, [medium]);

  return rows;
}
