import { db } from '@/lib/firebase';
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

  const q = query(collection(db, 'boards'), where('mediumId', '==', medium), orderBy('order'));
  return onSnapshot(
    q,
    snap => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))),
    err => {
      console.error('[boards] query error:', err);
      onErr?.(err);
      cb([]);
    }
  );
}
