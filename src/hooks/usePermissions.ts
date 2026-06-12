import { useAuthStore } from "@/store/auth.store";
import { hasPermission, hasRole, type Permission } from "@/lib/rbac";
import type { Role } from "@/types";

export function usePermissions() {
  const role = useAuthStore((s) => s.user?.role);
  return {
    role,
    can: (perm: Permission) => hasPermission(role, perm),
    is: (roles: Role | Role[]) => hasRole(role, roles),
  };
}
