import React from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  getDocs,
  where,
  writeBatch,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { createCatalogCourse, ensureCourseInstance, contextValid } from './api';

type Props = {
  ctx: { medium: string; board?: string | null; examId?: string | null };
  onAttached: (instanceId: string) => void; // returns /courses instance id
  allowExamSelection?: boolean; // allow changing exam context
};

export function CoursePicker({ ctx, onAttached, allowExamSelection = false }: Props) {
  const [catalog, setCatalog] = React.useState<{ id: string; name: string }[]>([]);
  const [exams, setExams] = React.useState<{ id: string; name: string }[]>([]);
  const [mode, setMode] = React.useState<'existing' | 'create'>('existing');
  const [selectedCatalogId, setSelectedCatalogId] = React.useState<string>('');
  const [newName, setNewName] = React.useState('');
  const [selectedExamId, setSelectedExamId] = React.useState<string>(ctx.examId || '');

  React.useEffect(() => {
    (async () => {
      try {
        // Load all course catalog items (simple list without complex filtering)
        // The course_catalog collection only has name, slug, createdAt, updatedAt fields
        const snap = await getDocs(query(collection(db, 'course_catalog'), orderBy('name')));

        const items = snap.docs.map(d => ({
          id: d.id,
          name: (d.data() as any).name || d.id,
        }));

        setCatalog(items);
      } catch (e) {
        console.error('load catalog failed', e);
        setCatalog([]);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (allowExamSelection) {
      const stop = onSnapshot(query(collection(db, 'exams'), orderBy('name')), snap => {
        setExams(snap.docs.map(d => ({ id: d.id, name: (d.data() as any).name })));
      });
      return stop;
    }
  }, [allowExamSelection]);

  const currentCtx = allowExamSelection
    ? { ...ctx, examId: selectedExamId || null, board: selectedExamId ? null : ctx.board }
    : ctx;

  const ready =
    contextValid(currentCtx) &&
    ((mode === 'existing' && selectedCatalogId) ||
      (mode === 'create' && newName.trim().length > 0));

  async function handleAttach() {
    if (!ready) return;

    try {
      // Ensure fresh claims for admin
      await getAuth().currentUser?.getIdToken(true);

      const catalogId =
        mode === 'existing' ? selectedCatalogId : await createCatalogCourse({ name: newName });

      const instanceId = await ensureCourseInstance({
        catalogId,
        medium: currentCtx.medium,
        board: currentCtx.board ?? null,
        examId: currentCtx.examId ?? null,
      });
      onAttached(instanceId);
    } catch (e) {
      console.error('attach failed', e);
      // Could show a toast/snackbar in your UI
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          type="button"
          className={`px-3 py-2 rounded border ${mode === 'existing' ? 'bg-blue-50 border-blue-300' : ''}`}
          onClick={() => setMode('existing')}
        >
          Use existing
        </button>
        <button
          type="button"
          className={`px-3 py-2 rounded border ${mode === 'create' ? 'bg-blue-50 border-blue-300' : ''}`}
          onClick={() => setMode('create')}
        >
          Create new
        </button>
      </div>

      {/* Exam selection if allowed */}
      {allowExamSelection && (
        <div>
          <label className="block text-sm mb-1">Select Exam Context</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
          >
            <option value="">— Select Exam —</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Choose which exam this course should be attached to.
          </p>
        </div>
      )}

      {mode === 'existing' ? (
        <div>
          <label className="block text-sm mb-1">Catalog course</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={selectedCatalogId}
            onChange={e => setSelectedCatalogId(e.target.value)}
          >
            <option value="">— Select from catalog —</option>
            {catalog.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm mb-1">New course name</label>
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="e.g., Algebra Class 10"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
        </div>
      )}

      {!contextValid(ctx) && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          Pick a <b>Medium</b> and either a <b>Board</b> or an <b>Exam</b> first.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          disabled={!ready}
          onClick={handleAttach}
        >
          Attach Course to this Context
        </button>
      </div>
    </div>
  );
}
