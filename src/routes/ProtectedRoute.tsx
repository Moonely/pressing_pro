import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useTenantStore } from "@/store/tenant.store";

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const tenant = useTenantStore((s) => s.current);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  // SUPER_ADMIN may navigate without an active tenant (e.g. /admin/tenants)
  if (!tenant && role !== "SUPER_ADMIN") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
