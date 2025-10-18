import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
  getDoc,
} from 'firebase/firestore';

export type Unsub = () => void;

export function listenMediums(cb: (rows: any[]) => void): Unsub {
  const q = query(collection(db, 'mediums'), where('enabled', '==', true), orderBy('order'));
  return onSnapshot(q, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function listenBoards(mediumId: string, cb: (rows: any[]) => void): Unsub {
  const q = query(
    collection(db, 'boards'),
    where('enabled', '==', true),
    where('mediumId', '==', mediumId),
    orderBy('order')
  );
  return onSnapshot(q, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function listenExams(mediumId: string, cb: (rows: any[]) => void): Unsub {
  const q = query(
    collection(db, 'exams'),
    where('enabled', '==', true),
    where('mediumId', '==', mediumId),
    orderBy('order')
  );
  return onSnapshot(q, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function listenCourses(
  ctx: { mediumId: string; boardId?: string | null; examId?: string | null },
  cb: (rows: any[]) => void
): Unsub {
  const filters = [
    where('enabled', '==', true),
    where('mediumId', '==', ctx.mediumId),
    ctx.boardId ? where('boardId', '==', ctx.boardId) : where('examId', '==', ctx.examId ?? null),
  ];
  const q = query(collection(db, 'courses'), ...filters, orderBy('order'));
  return onSnapshot(q, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function listenSubjects(ctx: { courseId: string }, cb: (rows: any[]) => void): Unsub {
  const q = query(
    collection(db, 'subjects'),
    where('enabled', '==', true),
    where('courseId', '==', ctx.courseId),
    orderBy('order')
  );
  return onSnapshot(q, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function listenChapters(subjectId: string, cb: (rows: any[]) => void): Unsub {
  const q = query(
    collection(db, 'chapters'),
    where('enabled', '==', true),
    where('subjectId', '==', subjectId),
    orderBy('order')
  );
  return onSnapshot(q, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function listenQuizSets(chapterId: string, cb: (rows: any[]) => void): Unsub {
  const q = query(
    collection(db, 'quiz_sets'),
    where('enabled', '==', true),
    where('chapterId', '==', chapterId),
    orderBy('order')
  );
  return onSnapshot(q, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))));
}
