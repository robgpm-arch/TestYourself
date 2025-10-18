import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  writeBatch,
  collectionGroup,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebase';
import {
  CatalogMedium,
  CatalogBoard,
  CatalogExam,
  CatalogCourse,
  CatalogSubject,
  CatalogChapter,
  CatalogQuizSet
} from '../types/firebase';

// Always refresh admin token once per admin session
export async function ensureAdminFreshToken() {
  await getAuth().currentUser?.getIdToken(true);
}

// Generic upsert function for admin operations
export async function upsert(coll: string, id: string, data: object) {
  await ensureAdminFreshToken();
  await setDoc(doc(db, coll, id), {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: getAuth().currentUser?.uid || 'admin',
    createdAt: (data as any).createdAt || serverTimestamp(),
    createdBy: (data as any).createdBy || (getAuth().currentUser?.uid || 'admin')
  }, { merge: true });
}

// Toggle enabled status
export async function toggleEnabled(coll: string, id: string, enabled: boolean) {
  await upsert(coll, id, { enabled });
}

// Utility: check if any docs exist where <field> == <value> in a collectionGroup
async function existsInGroup(groupName: string, field: string, value: string): Promise<boolean> {
  const q = query(collectionGroup(db, groupName), where(field, '==', value), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

// Firestore queries (filters that match the route)

// Boards for a Medium
export async function listBoards(mediumId: string): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const q = query(
    collection(db, 'boards'),
    where('mediumId', '==', mediumId),
    orderBy('order')
  );
  const snap = await getDocs(q);
  return snap.docs;
}

// Exams for a Medium - Robust loader with fallback
export async function listExams(mediumId: string): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const base = query(collection(db, 'exams'), where('mediumId', '==', mediumId));

  try {
    // Try indexed query first
    const snap = await getDocs(query(base, orderBy('order')));
    return snap.docs;
  } catch (err) {
    // Fallback: no index or missing field 'order'
    console.warn('[listExams] falling back (no index or \'order\' field):', err);
    const snap = await getDocs(base);
    return snap.docs;
  }
}

// Alias for consistency with user request
export async function listExamsByMedium(mediumId: string): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  return listExams(mediumId);
}

// Courses for Medium+Board or Medium+Exam (exactly one given)
export async function listCourses(mediumId: string, boardId?: string, examId?: string): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const col = collection(db, 'courses');
  const filters = boardId
    ? [where('mediumId', '==', mediumId), where('boardId', '==', boardId)]
    : [where('mediumId', '==', mediumId), where('examId', '==', examId!)];
  const q = query(col, ...filters, orderBy('order'));
  const snap = await getDocs(q);
  return snap.docs;
}

// Subjects for a Course
export async function listSubjects(courseId: string): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const q = query(collection(db, 'subjects'), where('courseId', '==', courseId), orderBy('order'));
  const snap = await getDocs(q);
  return snap.docs;
}

// Chapters for a Subject
export async function listChapters(subjectId: string): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const q = query(collection(db, 'chapters'), where('subjectId', '==', subjectId), orderBy('order'));
  const snap = await getDocs(q);
  return snap.docs;
}

// Quiz sets for a Chapter
export async function listQuizSets(chapterId: string): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const q = query(collection(db, 'quiz_sets'), where('chapterId', '==', chapterId), orderBy('order'));
  const snap = await getDocs(q);
  return snap.docs;
}

// "Catalog Course" dropdown: filtered by Medium + Board/Exam
export async function listCatalogCoursesForContext(mediumId: string, boardId?: string, examId?: string): Promise<CatalogCourse[]> {
  const docs = await listCourses(mediumId, boardId, examId);
  return docs.map(d => ({ id: d.id, ...(d.data() as Omit<CatalogCourse, 'id'>) }));
}

// Safe deletes with child checks

// Delete Course safely
export async function deleteCourse(courseId: string): Promise<void> {
  await ensureAdminFreshToken();

  const hasSubjects = await existsInGroup('subjects', 'courseId', courseId);
  if (hasSubjects) {
    throw new Error('Cannot delete: subjects exist under this course.');
  }

  await deleteDoc(doc(db, 'courses', courseId));
}

// Delete Subject safely
export async function deleteSubject(subjectId: string): Promise<void> {
  await ensureAdminFreshToken();

  const hasChapters = await existsInGroup('chapters', 'subjectId', subjectId);
  if (hasChapters) {
    throw new Error('Cannot delete: chapters exist under this subject.');
  }

  await deleteDoc(doc(db, 'subjects', subjectId));
}

// Delete Chapter safely
export async function deleteChapter(chapterId: string): Promise<void> {
  await ensureAdminFreshToken();

  const hasSets = await existsInGroup('quiz_sets', 'chapterId', chapterId);
  if (hasSets) {
    throw new Error('Cannot delete: quiz sets exist under this chapter.');
  }

  await deleteDoc(doc(db, 'chapters', chapterId));
}

// Delete Quiz Set
export async function deleteQuizSet(quizSetId: string): Promise<void> {
  await ensureAdminFreshToken();
  await deleteDoc(doc(db, 'quiz_sets', quizSetId));
}

// Optional: force cascade delete (explicit button only)
export async function cascadeDeleteCourse(courseId: string): Promise<void> {
  await ensureAdminFreshToken();

  // Gather subjects
  const subjQ = query(collection(db, 'subjects'), where('courseId', '==', courseId));
  const subjSnap = await getDocs(subjQ);

  const batch = writeBatch(db);

  for (const s of subjSnap.docs) {
    // Chapters under each subject
    const chapQ = query(collection(db, 'chapters'), where('subjectId', '==', s.id));
    const chapSnap = await getDocs(chapQ);

    for (const c of chapSnap.docs) {
      // Quiz sets under each chapter
      const setQ = query(collection(db, 'quiz_sets'), where('chapterId', '==', c.id));
      const setSnap = await getDocs(setQ);
      setSnap.forEach(d => batch.delete(d.ref));
      batch.delete(c.ref);
    }
    batch.delete(s.ref);
  }

  batch.delete(doc(db, 'courses', courseId));
  await batch.commit();
}

// Generate new document ID
export function generateId(collectionName: string): string {
  return doc(collection(db, collectionName)).id;
}

export default {
  listBoards,
  listExams,
  listCourses,
  listSubjects,
  listChapters,
  listQuizSets,
  listCatalogCoursesForContext,
  upsert,
  toggleEnabled,
  deleteCourse,
  deleteSubject,
  deleteChapter,
  deleteQuizSet,
  cascadeDeleteCourse,
  generateId,
  ensureAdminFreshToken
};