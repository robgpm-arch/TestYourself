import React, { useEffect, useState } from "react";
import {
  getDocs, query, where, orderBy, collection
} from "firebase/firestore";
import { db } from "../../lib/firebase";

// ----- Types are intentionally minimal so it compiles everywhere -----
type Option = { id: string; name: string };

export type Filters = {
  mediumId: string;
  boardId?: string | null;
  examId?: string | null;
  courseId?: string | null;
  subjectId?: string | null;
};

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  // you already know how you get these:
  mediums: Option[];
  boards: Option[];
  // these two are optional; keep if you already render Course/Subject selects here
  courses?: Option[];
  subjects?: Option[];
};

export default function CatalogFilters({
  filters, setFilters, mediums, boards, courses = [], subjects = []
}: Props) {
  const [exams, setExams] = useState<Option[]>([]);
  const { mediumId, boardId, examId, courseId, subjectId } = filters;

  // ---- helpers (mutually exclusive board vs exam) ----
  const pickMedium = (mid: string) =>
    setFilters({ mediumId: mid, boardId: null, examId: null, courseId: null, subjectId: null });

  const pickBoard = (bid: string | null) =>
    setFilters(f => ({ ...f, boardId: bid, examId: null, courseId: null, subjectId: null }));

  const pickExam = (eid: string | null) =>
    setFilters(f => ({ ...f, examId: eid, boardId: null, courseId: null, subjectId: null }));

  const pickCourse = (cid: string | null) =>
    setFilters(f => ({ ...f, courseId: cid, subjectId: null }));

  const pickSubject = (sid: string | null) =>
    setFilters(f => ({ ...f, subjectId: sid }));

  // ---- load exams for selected medium ----
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!mediumId) { setExams([]); return; }
      console.log("[ExamDropdown] mediumId used =", mediumId);

      const base = query(collection(db, "exams"), where("mediumId", "==", mediumId));

      try {
        // Try indexed query first
        const snap = await getDocs(query(base, orderBy("order")));
        if (ignore) return;
        const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setExams(
          rows
            .filter(r => r.enabled !== false && r.isVisible !== false && r.active !== false)
            .sort((a, b) => (a.order ?? 9e9) - (b.order ?? 9e9) || String(a.name).localeCompare(String(b.name)))
            .map(r => ({ id: r.id, name: r.name ?? r.id }))
        );
        console.log("[Exams] found (indexed)", rows.length);
      } catch (err) {
        // Fallback: no index or missing field 'order'
        console.warn("[Exams] falling back (no index or 'order' field):", err);
        const snap = await getDocs(base);               // no orderBy
        if (ignore) return;
        const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setExams(
          rows
            .filter(r => r.enabled !== false && r.isVisible !== false && r.active !== false)
            .sort((a, b) => String(a.name).localeCompare(String(b.name)))   // client sort
            .map(r => ({ id: r.id, name: r.name ?? r.id }))
        );
        console.log("[Exams] found (fallback)", rows.length);
      }
    })();
    return () => { ignore = true; };
  }, [mediumId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Medium */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Medium</label>
        <select
          className="w-full p-2 border rounded"
          value={mediumId}
          onChange={(e) => pickMedium(e.target.value)}
        >
          <option value="">Select</option>
          {mediums.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {/* Board */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
        <select
          className="w-full p-2 border rounded disabled:bg-gray-100"
          value={boardId ?? ""}
          onChange={(e) => pickBoard(e.target.value || null)}
          disabled={!mediumId || !!examId}  // disable if exam picked
        >
          <option value="">{boards.length ? "Select" : "No Boards"}</option>
          {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* EXAM (new) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
        <select
          className="w-full p-2 border rounded disabled:bg-gray-100"
          value={examId ?? ""}
          onChange={(e) => pickExam(e.target.value || null)}
          disabled={!mediumId || !!boardId} // disable if board picked
        >
          <option value="">{exams.length ? "Select" : "No Exams"}</option>
          {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </select>
      </div>

      {/* Course */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
        <select
          className="w-full p-2 border rounded disabled:bg-gray-100"
          value={courseId ?? ""}
          onChange={(e) => pickCourse(e.target.value || null)}
          disabled={!mediumId || (!boardId && !examId)}
        >
          <option value="">{courses.length ? "Select" : "No Courses"}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <select
          className="w-full p-2 border rounded disabled:bg-gray-100"
          value={subjectId ?? ""}
          onChange={(e) => pickSubject(e.target.value || null)}
          disabled={!courseId}
        >
          <option value="">{subjects.length ? "Select" : "No Subjects"}</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Current Tab Indicator */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current Level</label>
        <div className="p-2 bg-white border rounded text-sm font-medium">
          Managing: {subjectId ? 'Chapters' :
                    courseId ? 'Subjects' :
                    (boardId || examId) ? 'Courses' :
                    mediumId ? 'Boards/Exams' : 'Mediums'}
        </div>
      </div>
    </div>
  );
}