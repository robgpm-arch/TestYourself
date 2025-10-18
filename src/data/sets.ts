import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function getSets(courseId: string, subjectId: string, chapterId: string) {
  const ref = collection(
    db,
    `courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}/sets`
  );
  const snap = await getDocs(query(ref, orderBy('order', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function getQuestions(path: string) {
  // path = courses/..../sets/{setId}
  const ref = collection(db, `${path}/questions`);
  const snap = await getDocs(query(ref, orderBy('id', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}
