import React from 'react';
import { loadBoardsForMedium } from '@/admin/shared/smartBoardsExams';
import { ExamSelect } from '@/admin/shared/ExamSelect';
import { filtersReady } from './filterUtils';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getDb } from '@/lib/firebaseClient';

type AnyDoc = { id: string; [k: string]: any };

export function CoursesHeader({
  filters,
  setFilters,
}: {
  filters: { medium: string; board: string; examId: string };
  setFilters: (patch: Partial<typeof filters>) => void;
}) {
  const [mediums, setMediums] = React.useState<AnyDoc[]>([]);
  const [boards, setBoards] = React.useState<AnyDoc[]>([]);

  React.useEffect(() => {
    let stop: any = null;
    (async () => {
      try {
        const db = await getDb();
        stop = onSnapshot(query(collection(db, 'mediums'), orderBy('order')), (snap: any) => {
          setMediums(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
        });
      } catch (e) {
        console.error('load mediums failed', e);
      }
    })();
    return () => stop?.();
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      // Load boards filtered by selected medium
      const medium = filters.medium || '';
      const b = await loadBoardsForMedium(medium);
      if (alive) {
        setBoards(b);
      }
    })();
    // Clear selections when medium changes
    setFilters({ board: '', examId: '' });
    return () => {
      alive = false;
    };
  }, [filters.medium]);

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Medium */}
      <label className="text-sm">
        <div className="mb-1">Medium</div>
        <select
          className="border rounded px-3 py-2"
          value={filters.medium || ''}
          onChange={e => setFilters({ medium: e.target.value, board: '', examId: '' })}
        >
          <option value="">All Mediums</option>
          {mediums.map(m => (
            <option key={m.id} value={m.id}>
              {m.title ?? m.name ?? m.id}
            </option>
          ))}
        </select>
      </label>

      {/* Board */}
      <label className="text-sm">
        <div className="mb-1">Board</div>
        <select
          className="border rounded px-3 py-2"
          value={filters.board || ''}
          disabled={!filters.medium}
          onChange={e => {
            const value = e.target.value;
            setFilters({
              board: value,
              examId: value ? '' : filters.examId, // Clear exam if board selected
            });
          }}
        >
          <option value="">Select Board</option>
          {boards.map(b => (
            <option key={b.id} value={b.name ?? b.title ?? b.label ?? b.id}>
              {b.name ?? b.title ?? b.label ?? b.id}
            </option>
          ))}
        </select>
      </label>

      {/* Exam */}
      <ExamSelect
        medium={filters.medium}
        value={filters.examId || ''}
        onChange={value => {
          setFilters({
            examId: value,
            board: value ? '' : filters.board, // Clear board if exam selected
          });
        }}
      />

      {!filters.medium && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          Pick a <b>Medium</b>, then choose <b>Board</b> or <b>Exam</b>.
        </div>
      )}
      {filters.medium && !filters.board && !filters.examId && (
        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1">
          Select a <b>Board</b> or <b>Exam</b> to associate this course with.
        </div>
      )}
    </div>
  );
}
