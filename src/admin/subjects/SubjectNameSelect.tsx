import React from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { getDb } from '../../lib/firebaseClient';

// Some sensible defaults; extend as you like
const SUBJECT_PRESETS = [
  'Algebra',
  'Geometry',
  'Trigonometry',
  'Arithmetic',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Civics',
  'English',
  'Hindi',
  'Telugu',
  'Computer Science',
  'General Knowledge',
];

export function SubjectNameSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [options, setOptions] = React.useState<string[]>(SUBJECT_PRESETS);

  React.useEffect(() => {
    // merge unique names already present in /subjects (case-insensitive)
    let stop: any = null;
    (async () => {
      try {
        const db = await getDb();
        stop = onSnapshot(collection(db, 'subjects'), (snap: any) => {
          const names = snap.docs.map((d: any) => (d.data() as any).name).filter(Boolean) as string[];
          const set = new Set([...SUBJECT_PRESETS, ...names].map(s => s.trim()));
          setOptions(Array.from(set).sort((a, b) => a.localeCompare(b)));
        });
      } catch (e) {
        console.error('subjectlist failed', e);
      }
    })();
    return () => stop?.();
  }, []);

  return (
    <div>
      <label className="block mb-1 text-sm font-medium">
        Subject <span className="text-red-600">*</span>
      </label>
      <input
        list="subject-options"
        className="border rounded px-3 py-2 w-full"
        placeholder="Start typing or pick a subject"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        required
      />
      <datalist id="subject-options">
        {options.map(opt => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
      <p className="mt-1 text-xs text-slate-500">Don't see it? Just type the name to create it.</p>
    </div>
  );
}
