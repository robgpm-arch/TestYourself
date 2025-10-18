import React, { useEffect, useState } from "react";
import type { SubjectInput } from "../../services/adminCatalogService";

type Props = {
  open: boolean;
  initial?: Partial<SubjectInput>; // when editing
  onClose: () => void;
  onSubmit: (data: SubjectInput) => Promise<void>;
};

export default function SubjectFormModal({ open, initial, onClose, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [order, setOrder] = useState<number>(initial?.order ?? 1);
  const [enabled, setEnabled] = useState<boolean>(initial?.enabled ?? true);

  // context (required)
  const [mediumId, setMediumId] = useState(initial?.mediumId ?? "");
  const [courseId, setCourseId] = useState(initial?.courseId ?? "");
  const [boardId, setBoardId] = useState<string | null>(initial?.boardId ?? null);
  const [examId, setExamId] = useState<string | null>(initial?.examId ?? null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setOrder(initial?.order ?? 1);
    setEnabled(initial?.enabled ?? true);
    setMediumId(initial?.mediumId ?? "");
    setCourseId(initial?.courseId ?? "");
    setBoardId(initial?.boardId ?? null);
    setExamId(initial?.examId ?? null);
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">
          {initial?.name ? "Edit Subject" : "Add Subject"}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full rounded border p-2"
                   value={name} onChange={e=>setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Order</label>
              <input type="number" min={1} className="w-full rounded border p-2"
                     value={order} onChange={e=>setOrder(+e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input id="en" type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)} />
              <label htmlFor="en" className="text-sm">Visible</label>
            </div>
          </div>

          {/* Context (lock these when editing; prefill from filters) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Medium ID</label>
              <input className="w-full rounded border p-2 bg-gray-50"
                     value={mediumId} onChange={e=>setMediumId(e.target.value)} disabled={!!initial?.name}/>
            </div>
            <div>
              <label className="block text-sm mb-1">Course ID</label>
              <input className="w-full rounded border p-2 bg-gray-50"
                     value={courseId} onChange={e=>setCourseId(e.target.value)} disabled={!!initial?.name}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Board ID (optional)</label>
              <input className="w-full rounded border p-2 bg-gray-50"
                     value={boardId ?? ""} onChange={e=>setBoardId(e.target.value || null)} disabled={!!initial?.name && initial?.boardId !== undefined}/>
            </div>
            <div>
              <label className="block text-sm mb-1">Exam ID (optional)</label>
              <input className="w-full rounded border p-2 bg-gray-50"
                     value={examId ?? ""} onChange={e=>setExamId(e.target.value || null)} disabled={!!initial?.name && initial?.examId !== undefined}/>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button className="rounded border px-3 py-2" onClick={onClose}>Cancel</button>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            disabled={!name || !mediumId || !courseId || (!!boardId && !!examId)}
            onClick={() =>
              onSubmit({ name, order, enabled, mediumId, courseId, boardId, examId })
            }>
            {initial?.name ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}