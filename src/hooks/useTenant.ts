import { useTenantStore } from "@/store/tenant.store";

export function useTenant() {
  const current = useTenantStore((s) => s.current);
  const available = useTenantStore((s) => s.available);
  const setCurrent = useTenantStore((s) => s.setCurrent);
  return { tenant: current, tenants: available, setTenant: setCurrent };
}
