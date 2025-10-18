import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useEffect, useState } from 'react';
import { getUserGate, routeNeedsCourse } from './guardHelpers';

export function RequireAdmin() {
  const [state, setState] = useState<'loading' | 'ok' | 'deny'>('loading');

  useEffect(() => {
    return onAuthStateChanged(auth, async (u: User | null) => {
      if (!u) return setState('deny');
      const token = await u.getIdTokenResult(true);
      setState(token.claims.admin ? 'ok' : 'deny');
    });
  }, []);

  if (state === 'loading') return <div className="p-6">Checking admin…</div>;
  if (state === 'ok') return <Outlet />;
  return <Navigate to="/admin/login" replace />;
}

export function Guarded({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [state, setState] = useState<'loading' | 'ready'>('loading');
  const [gate, setGate] = useState({ signedIn: false, onboarded: false, courseChosen: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      const g = await getUserGate();
      if (!alive) return;
      setGate({ signedIn: g.signedIn, onboarded: g.onboarded, courseChosen: g.courseChosen });
      setState('ready');
    })();
    return () => {
      alive = false;
    };
  }, [location.pathname]);

  if (state === 'loading') return null;

  if (!gate.signedIn) return <Navigate to="/" replace />;
  if (!gate.onboarded) return <Navigate to="/onboarding" replace />;

  if (routeNeedsCourse(location.pathname) && !gate.courseChosen) {
    return <Navigate to="/change-course" replace />;
  }

  return <>{children}</>;
}
