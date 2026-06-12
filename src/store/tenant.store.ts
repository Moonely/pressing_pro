import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tenant } from "@/types";
import { STORAGE_KEYS } from "@/constants";

interface TenantState {
  current: Tenant | null;
  available: Tenant[];
  setCurrent: (tenant: Tenant | null) => void;
  setAvailable: (tenants: Tenant[]) => void;
  reset: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      current: null,
      available: [],
      setCurrent: (current) => set({ current }),
      setAvailable: (available) => set({ available }),
      reset: () => set({ current: null, available: [] }),
    }),
    { name: STORAGE_KEYS.tenant }
  )
);

/** Pure accessor used by services / API client (no React). */
export function getActiveTenantId(): string | null {
  return useTenantStore.getState().current?.id ?? null;
}
