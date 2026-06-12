import type { AuthSession } from "@/types";
import type { LoginInput } from "../schemas/auth.schema";
import { db } from "@/lib/mock-db";

/**
 * Mock auth. Replace by apiClient.post('/auth/login', input) when wiring
 * the NestJS backend. The real JWT will carry `{ sub, role, tenantId }`.
 *
 * Demo accounts:
 *  - super@pressingpro.com  → SUPER_ADMIN (access to all tenants)
 *  - admin@pressingpro.com  → TENANT_ADMIN of Pressing Dakar
 *  - employe@pressingpro.com → EMPLOYEE of Pressing Dakar
 *  - admin.thies@pressingpro.com → TENANT_ADMIN of Pressing Thiès
 */
export const authService = {
  async login(input: LoginInput): Promise<AuthSession> {
    await new Promise((r) => setTimeout(r, 350));
    const email = input.email.toLowerCase();

    if (email.startsWith("super")) {
      return {
        user: { id: "usr_super", email, firstName: "Sasha", lastName: "Admin", role: "SUPER_ADMIN", tenantId: null },
        accessToken: "mock.jwt.super", refreshToken: "mock.refresh",
        tenants: db.tenants,
      };
    }
    if (email.startsWith("admin.thies")) {
      const t = db.tenants.find((x) => x.slug === "pressing-thies")!;
      return {
        user: { id: "usr_thies", email, firstName: "Mariam", lastName: "Sarr", role: "TENANT_ADMIN", tenantId: t.id },
        accessToken: "mock.jwt.thies", refreshToken: "mock.refresh", tenants: [t],
      };
    }
    if (email.startsWith("admin")) {
      const t = db.tenants.find((x) => x.slug === "pressing-dakar")!;
      return {
        user: { id: "usr_admin", email, firstName: "Awa", lastName: "Diop", role: "TENANT_ADMIN", tenantId: t.id },
        accessToken: "mock.jwt.admin", refreshToken: "mock.refresh", tenants: [t],
      };
    }
    const t = db.tenants.find((x) => x.slug === "pressing-dakar")!;
    return {
      user: { id: "usr_emp", email, firstName: "Moussa", lastName: "Ndiaye", role: "EMPLOYEE", tenantId: t.id },
      accessToken: "mock.jwt.emp", refreshToken: "mock.refresh", tenants: [t],
    };
  },
  async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
  },
};
