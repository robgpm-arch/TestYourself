import React from 'react';
import { listenCoursesForContext, Course } from './coursesApi';

export function CourseSelect({
  medium,
  board,
  examId,
  value,
  onChange,
  disabled,
}: {
  medium: string;
  board?: string | '';
  examId?: string | '';
  value: { id: string; name: string } | null;
  onChange: (v: { id: string; name: string } | null) => void;
  disabled?: boolean;
}) {
  const [courses, setCourses] = React.useState<Course[]>([]);
  React.useEffect(() => {
    if (!medium) {
      setCourses([]);
      return;
    }
    return listenCoursesForContext({ medium, board, examId }, setCourses);
  }, [medium, board, examId]);

  const none = courses.length === 0;

  return (
    <div>
      <label className="block mb-1 text-sm font-medium">Course</label>
      <div className="flex items-center gap-2">
        <select
          className="border rounded px-3 py-2"
          value={value?.id || ''}
          disabled={disabled || !medium || none}
          onChange={e => {
            const c = courses.find(x => x.id === e.target.value);
            onChange(c ? { id: c.id, name: c.name } : null);
          }}
        >
          <option value="">{none ? '— No courses in this context —' : '— Optional —'}</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {/* Optional quick-clear */}
        {!!value && (
          <button
            type="button"
            className="text-xs px-2 py-1 border rounded"
            onClick={() => onChange(null)}
          >
            Clear
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Lists courses for <b>{medium}</b> and{' '}
        {board && board !== 'All Boards' ? (
          <>
            board <b>{board}</b>
          </>
        ) : (
          <>
            exam <b>{examId || '—'}</b>
          </>
        )}
        .
      </p>
    </div>
  );
}
