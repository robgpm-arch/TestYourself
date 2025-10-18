import { Navigate, Outlet } from "react-router-dom";
import { useAdminClaim } from "@/hooks/useAdminClaim";

export default function AuthGate() {
  const { user, loading } = useAdminClaim();
  if (loading) return <div className="p-6">Loading…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}