import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query, where, QueryConstraint } from 'firebase/firestore';

export type Course = {
  id: string;
  name: string;
  medium?: string;
  board?: string;
  examId?: string;
  order?: number;
  enabled?: boolean;
};

export function listenCoursesForContext(
  ctx: { medium: string; board?: string | ''; examId?: string | '' },
  cb: (rows: Course[]) => void
) {
  const cs: QueryConstraint[] = [where('medium', '==', ctx.medium), orderBy('order')];

  // Filter by Board OR Exam (whichever the user picked)
  if (ctx.board && ctx.board !== 'All Boards') cs.push(where('board', '==', ctx.board));
  else if (ctx.examId && ctx.examId !== 'All Exams' && ctx.examId !== '')
    cs.push(where('examId', '==', ctx.examId));

  const q = query(collection(db, 'courses'), ...cs);
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));
}
