import type { Role } from "@/types";

/**
 * Permission keys — keep in sync with the NestJS backend `@Permissions()`
 * decorator. Format: "<resource>:<action>".
 */
export type Permission =
  | "tenant:read"
  | "tenant:manage"
  | "user:read"
  | "user:manage"
  | "client:read"
  | "client:write"
  | "order:read"
  | "order:write"
  | "order:cancel"
  | "payment:read"
  | "payment:write"
  | "machine:read"
  | "machine:write"
  | "stats:read";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "tenant:read", "tenant:manage",
    "user:read", "user:manage",
    "client:read", "client:write",
    "order:read", "order:write", "order:cancel",
    "payment:read", "payment:write",
    "machine:read", "machine:write",
    "stats:read",
  ],
  TENANT_ADMIN: [
    "user:read", "user:manage",
    "client:read", "client:write",
    "order:read", "order:write", "order:cancel",
    "payment:read", "payment:write",
    "machine:read", "machine:write",
    "stats:read",
  ],
  EMPLOYEE: [
    "client:read", "client:write",
    "order:read", "order:write",
    "payment:read", "payment:write",
    "machine:read",
  ],
};

export function hasRole(userRole: Role | undefined, roles: Role | Role[]): boolean {
  if (!userRole) return false;
  const list = Array.isArray(roles) ? roles : [roles];
  return list.includes(userRole);
}

export function hasPermission(userRole: Role | undefined, perm: Permission): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole].includes(perm);
}

export function hasAnyPermission(userRole: Role | undefined, perms: Permission[]): boolean {
  return perms.some((p) => hasPermission(userRole, p));
}
