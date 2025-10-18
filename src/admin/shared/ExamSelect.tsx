import * as React from 'react';
import { useExamsByMedium } from './useExamsByMedium';

export function ExamSelect({
  medium,
  value,
  onChange,
  disabled,
}: {
  medium?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const exams = useExamsByMedium(medium);

  return (
    <label className="block">
      <div className="mb-1 text-sm">Exam</div>
      <select
        className="border rounded px-3 py-2 w-full"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || !medium}
      >
        <option value="">
          {exams.length ? 'Select an option' : '— No exams for this medium —'}
        </option>
        {exams.map(ex => (
          <option key={ex.id} value={ex.id}>
            {ex.name ?? ex.id}
          </option>
        ))}
      </select>
    </label>
  );
}
