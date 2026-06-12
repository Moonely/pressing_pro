import { db } from "@/lib/mock-db";
import type { Tenant } from "@/types";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/** SUPER_ADMIN-only endpoints. NestJS route: /tenants */
export const tenantsService = {
  async list(): Promise<Tenant[]> {
    await delay();
    return db.tenants.slice();
  },
  async setActive(id: string): Promise<Tenant> {
    await delay(80);
    const t = db.tenants.find((x) => x.id === id);
    if (!t) throw new Error("Tenant introuvable");
    return t;
  },
  async toggleActive(id: string): Promise<Tenant> {
    await delay();
    const t = db.tenants.find((x) => x.id === id);
    if (!t) throw new Error("Tenant introuvable");
    t.active = !t.active;
    return t;
  },
};
