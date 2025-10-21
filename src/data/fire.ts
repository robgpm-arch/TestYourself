import { getDb } from '@/lib/firebaseClient';
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

/**
 * Subscribe lazily: returns a synchronous unsub function that will
 * detach the real subscription once ready. This preserves the current
 * API surface while avoiding eager db import at module load time.
 */
function subscribeLazy(
  buildQuery: (db: any) => any,
  cb: (rows: any[]) => void
): Unsub {
  let realUnsub: Unsub | null = null;
  let cancelled = false;

  (async () => {
    try {
      const db = await getDb();
      if (cancelled) return;
      const q = buildQuery(db);
  realUnsub = onSnapshot(q, (s: any) => cb(s.docs.map((d: any) => ({ id: d.id, ...d.data() }))));
    } catch {
      // swallow and keep API safe
    }
  })();

  return () => {
    cancelled = true;
    try {
      realUnsub?.();
    } catch {}
  };
}

export function listenMediums(cb: (rows: any[]) => void): Unsub {
  return subscribeLazy(db => query(collection(db, 'mediums'), where('enabled', '==', true), orderBy('order')), cb);
}

export function listenBoards(mediumId: string, cb: (rows: any[]) => void): Unsub {
  return subscribeLazy(db => query(
    collection(db, 'boards'),
    where('enabled', '==', true),
    where('mediumId', '==', mediumId),
    orderBy('order')
  ), cb);
}

export function listenExams(mediumId: string, cb: (rows: any[]) => void): Unsub {
  return subscribeLazy(db => query(
    collection(db, 'exams'),
    where('enabled', '==', true),
    where('mediumId', '==', mediumId),
    orderBy('order')
  ), cb);
}

export function listenCourses(
  ctx: { mediumId: string; boardId?: string | null; examId?: string | null },
  cb: (rows: any[]) => void
): Unsub {
  return subscribeLazy(db => {
    const filters = [
      where('enabled', '==', true),
      where('mediumId', '==', ctx.mediumId),
      ctx.boardId ? where('boardId', '==', ctx.boardId) : where('examId', '==', ctx.examId ?? null),
    ];
    return query(collection(db, 'courses'), ...filters, orderBy('order'));
  }, cb);
}

export function listenSubjects(ctx: { courseId: string }, cb: (rows: any[]) => void): Unsub {
  return subscribeLazy(db => query(
    collection(db, 'subjects'),
    where('enabled', '==', true),
    where('courseId', '==', ctx.courseId),
    orderBy('order')
  ), cb);
}

export function listenChapters(subjectId: string, cb: (rows: any[]) => void): Unsub {
  return subscribeLazy(db => query(
    collection(db, 'chapters'),
    where('enabled', '==', true),
    where('subjectId', '==', subjectId),
    orderBy('order')
  ), cb);
}

export function listenQuizSets(chapterId: string, cb: (rows: any[]) => void): Unsub {
  return subscribeLazy(db => query(
    collection(db, 'quiz_sets'),
    where('enabled', '==', true),
    where('chapterId', '==', chapterId),
    orderBy('order')
  ), cb);
}
