import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useTenantStore } from "@/store/tenant.store";
import { resolveTenantSlugFromHost, resolveTenantSlugFromQuery } from "@/lib/tenant";

/**
 * Boot-time tenant resolution:
 *  1. URL `?tenant=slug` (preview override)
 *  2. Sub-domain `<slug>.app.example.com`
 *  3. Persisted active tenant from store
 *
 * The chosen tenant must belong to the authenticated user's `tenants`.
 * SUPER_ADMIN can switch freely via TenantSwitcher.
 */
export function TenantResolver({ children }: { children: ReactNode }) {
  const tenants = useAuthStore((s) => s.tenants);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const current = useTenantStore((s) => s.current);
  const setCurrent = useTenantStore((s) => s.setCurrent);
  const setAvailable = useTenantStore((s) => s.setAvailable);

  useEffect(() => {
    setAvailable(tenants);
    if (!isAuthenticated || tenants.length === 0) return;

    const slug = resolveTenantSlugFromQuery() ?? resolveTenantSlugFromHost();
    const fromHost = slug ? tenants.find((t) => t.slug === slug) : undefined;

    if (fromHost) {
      if (current?.id !== fromHost.id) setCurrent(fromHost);
      return;
    }

    if (current && tenants.some((t) => t.id === current.id)) return;
    setCurrent(tenants[0]);
  }, [tenants, isAuthenticated, current, setCurrent, setAvailable]);

  return <>{children}</>;
}
