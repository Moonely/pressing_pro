import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, Role, Tenant, User } from "@/types";
import { STORAGE_KEYS } from "@/constants";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tenants: Tenant[];
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      tenants: [],
      isAuthenticated: false,
      setSession: (session) =>
        set({
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          tenants: session.tenants,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          tenants: [],
          isAuthenticated: false,
        }),
    }),
    { name: STORAGE_KEYS.session }
  )
);

export function getCurrentRole(): Role | undefined {
  return useAuthStore.getState().user?.role;
}
