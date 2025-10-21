import React from 'react';
import { getApp, getDb, getAuth } from '@/lib/firebaseClient';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';

const TASKS: Record<string, string> = {
  screens: 'Screens',
  themes: 'Themes',
  mediumsBoardsExams: 'Mediums · Boards · Exams (backfill)',
  courses: 'Courses (backfill)',
  subjects: 'Subjects (backfill)',
  chapters: 'Chapters (backfill)',
  sets: 'Quiz Sets (backfill)',
  assetsScan: 'Scan Storage assets',
  searchBackfill: 'Backfill search tokens',
};

async function assertAdmin() {
  const auth = await getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in.');
  const { getIdTokenResult } = await import('firebase/auth');
  const t = await getIdTokenResult(user, true);
  if (!t.claims.admin) throw new Error('You are not an admin.');
}

export default function SyncCenterCard() {
  const [selected, setSelected] = React.useState<string[]>(['screens', 'themes']);
  const [dryRun, setDryRun] = React.useState(false);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [job, setJob] = React.useState<any>(null);
  const [logs, setLogs] = React.useState<any[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const region = import.meta.env.VITE_FUNCTIONS_REGION?.trim();

  // Listen to job document (status)
  React.useEffect(() => {
    if (!jobId) return;
    let stop: any = null;
    (async () => {
      try {
        const db = await getDb();
        stop = onSnapshot(
          doc(db, 'sync_jobs', jobId),
          (s: any) => setJob({ id: s.id, ...s.data() }),
          (e: any) => setErr(`job listener: ${e.code} — ${e.message}`)
        );
      } catch (e) {
        console.error('job listener failed', e);
        setErr(String(e));
      }
    })();
    return () => stop?.();
  }, [jobId]);

  // Listen to job logs
  React.useEffect(() => {
    if (!jobId) return;
    let stop: any = null;
    (async () => {
      try {
        const db = await getDb();
        const qy = query(collection(db, 'sync_jobs', jobId, 'logs'), orderBy('ts', 'asc'));
        stop = onSnapshot(
          qy,
          (s: any) => setLogs(s.docs.map((d: any) => ({ id: d.id, ...d.data() }))),
          (e: any) => setErr(`logs listener: ${e.code} — ${e.message}`)
        );
      } catch (e) {
        console.error('logs listener failed', e);
        setErr(String(e));
      }
    })();
    return () => stop?.();
  }, [jobId]);

  const toggle = (k: string) =>
    setSelected(prev => (prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]));

  async function run() {
    setBusy(true);
    setErr(null);
    setLogs([]);
    setJobId(null);
    setJob(null);
    try {
      await assertAdmin();
      const app = await getApp();
      const fnClient = getFunctions(app, region || undefined);
      const call = httpsCallable(fnClient, 'runSync');
      const res: any = await call({ tasks: selected, dryRun });
      if (!res?.data?.jobId) {
        setErr('runSync returned no jobId; check Functions logs/region.');
      } else {
        setJobId(res.data.jobId);
      }
    } catch (e: any) {
      console.error('runSync failed:', e);
      const msg = [e.code || e.name, e.message, JSON.stringify(e.details || {})]
        .filter(Boolean)
        .join(' — ');
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border p-4 bg-white">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sync Center</h2>
        <div className="text-sm text-slate-500">
          {jobId
            ? `Job: ${jobId} • ${job?.ok ? 'OK' : job?.finishedAt ? 'Error' : 'Running…'}`
            : null}
        </div>
      </div>

      <p className="text-slate-600 mt-1 mb-3">
        Seed/merge registries, backfill data, and scan assets. Admin-only.
      </p>

      <div className="grid md:grid-cols-2 gap-2 mb-3">
        {Object.entries(TASKS).map(([k, label]) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={selected.includes(k)} onChange={() => toggle(k)} />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={dryRun} onChange={() => setDryRun(v => !v)} />
        <span>Dry-run only</span>
      </label>

      <div className="flex gap-2 items-center">
        <button
          onClick={run}
          disabled={busy || selected.length === 0}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {busy ? 'Starting…' : 'Run sync'}
        </button>
        {err && <span className="text-red-600 text-sm">{err}</span>}
      </div>

      {!!logs.length && (
        <div className="mt-4 max-h-64 overflow-auto bg-slate-50 rounded p-2 text-sm">
          {logs.map(l => (
            <div key={l.id} className="mb-1">
              <span className="text-slate-500">
                {l.ts?.toDate ? new Date(l.ts.toDate()).toLocaleTimeString() : ''} —{' '}
              </span>
              <strong>{l.step}</strong>:{' '}
              <code className="break-all">{JSON.stringify(l.detail)}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
