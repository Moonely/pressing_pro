import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { hasRole } from "@/lib/rbac";
import type { Role } from "@/types";

interface Props {
  roles: Role | Role[];
}

export function RequireRole({ roles }: Props) {
  const role = useAuthStore((s) => s.user?.role);
  if (!hasRole(role, roles)) return <Navigate to="/403" replace />;
  return <Outlet />;
}
