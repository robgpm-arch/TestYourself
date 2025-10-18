import { Navigate, Outlet } from "react-router-dom";
import { useAdminClaim } from "@/hooks/useAdminClaim";

export default function AdminRoute() {
  const { user, isAdmin, loading } = useAdminClaim();

  if (loading) return <div className="p-6">Checking admin access…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/no-access" replace />;

  return <Outlet />;
}