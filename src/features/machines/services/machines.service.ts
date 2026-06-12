import { db, scoped, startCycle, stopCycle, requireTenant } from "@/lib/mock-db";
import { getActiveTenantId } from "@/store/tenant.store";
import type { Machine } from "@/types";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const machinesService = {
  async list(): Promise<Machine[]> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    return scoped.machines(tenantId).slice();
  },
  async start(machineId: string, orderId: string | undefined, program: string, durationMin: number): Promise<Machine> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    startCycle(tenantId, machineId, orderId, program, durationMin);
    return db.machines.find((m) => m.id === machineId)!;
  },
  async stop(machineId: string): Promise<Machine> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    stopCycle(tenantId, machineId);
    return db.machines.find((m) => m.id === machineId)!;
  },
};
