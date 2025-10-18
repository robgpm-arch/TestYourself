import React from "react";

export type SubjectRow = {
  id: string;
  name: string;
  enabled?: boolean;
  order?: number;
  boardId?: string | null;
  examId?: string | null;
};

export default function SubjectCard({
  row,
  boardName,
  examName,
  onToggleVisible,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  row: SubjectRow;
  boardName: Record<string, string>;
  examName: Record<string, string>;
  onToggleVisible: (id: string, next: boolean) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const boardLabel = row.boardId ? (boardName[row.boardId] ?? row.boardId) : "—";
  const examLabel  = row.examId  ? (examName[row.examId]   ?? row.examId)  : "—";

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">{row.name}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={() => onToggleVisible(row.id, !(row.enabled ?? true))}
          >
            {row.enabled === false ? "Hidden" : "Visible"}
          </button>
          <button type="button" className="text-blue-600 hover:text-blue-800 underline" onClick={() => onEdit(row.id)}>Edit</button>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-700 space-y-1">
        <div><span className="text-gray-500 mr-2">Board:</span>{boardLabel}</div>
        <div><span className="text-gray-500 mr-2">Exam:</span>{examLabel}</div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">Order: {row.order ?? "—"}</span>
        <div className="flex gap-2">
          <button type="button" className="rounded border px-3 py-1" onClick={() => onDuplicate(row.id)}>Duplicate</button>
          <button type="button" className="rounded bg-red-600 px-3 py-1 text-white" onClick={() => onDelete(row.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}