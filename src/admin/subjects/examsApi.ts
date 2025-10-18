import { db } from "../../lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export type Exam = { id: string; name: string; board?: string; courseId?: string; enabled?: boolean; order?: number };

export function listenExams(cb: (rows: Exam[]) => void) {
  const q = query(collection(db, "exams"), orderBy("order"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));
}