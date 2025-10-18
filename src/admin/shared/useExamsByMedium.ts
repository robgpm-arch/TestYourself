import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";

export type Exam = { id: string; name: string; medium?: string; order?: number; enabled?: boolean };

export function useExamsByMedium(medium?: string) {
  const [rows, setRows] = React.useState<Exam[]>([]);
  React.useEffect(() => {
    if (!medium) { setRows([]); return; }
    try {
      const q = query(collection(db, "exams"), where("medium", "==", medium), orderBy("order"));
      return onSnapshot(
        q,
        s => setRows(s.docs.map(d => ({ id: d.id, ...(d.data() as any) }))),
        e => { console.error("[exams] load failed:", e); setRows([]); }
      );
    } catch (e) {
      console.error("[exams] query build failed:", e);
      setRows([]);
    }
  }, [medium]);
  return rows;
}