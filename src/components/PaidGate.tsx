import { useAuth } from '../contexts/AuthContext';

export default function PaidGate({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();

  if (loading) return <div>Loading…</div>;
  if (!firebaseUser) return <div>Please sign in to continue.</div>;

  // Allow access for any authenticated user (no phone verification required)
  return <>{children}</>;
}
