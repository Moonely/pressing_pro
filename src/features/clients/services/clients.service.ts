import { db, genId, scoped, requireTenant } from "@/lib/mock-db";
import { getActiveTenantId } from "@/store/tenant.store";
import type { Client, Order, Paginated } from "@/types";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const clientsService = {
  async list(params: { search?: string; page?: number; pageSize?: number } = {}): Promise<Paginated<Client>> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const { search = "", page = 1, pageSize = 10 } = params;
    const q = search.trim().toLowerCase();
    const tenantClients = scoped.clients(tenantId);
    const filtered = q
      ? tenantClients.filter(
          (c) =>
            c.firstName.toLowerCase().includes(q) ||
            c.lastName.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q)
        )
      : tenantClients;
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const start = (page - 1) * pageSize;
    return { data: sorted.slice(start, start + pageSize), total: sorted.length, page, pageSize };
  },

  async create(input: { firstName: string; lastName: string; phone: string }): Promise<Client> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const client: Client = {
      id: genId("cli"),
      tenantId,
      ...input,
      createdAt: new Date().toISOString(),
      ordersCount: 0,
      totalSpent: 0,
    };
    db.clients.unshift(client);
    return client;
  },

  async update(id: string, input: Partial<Pick<Client, "firstName" | "lastName" | "phone">>): Promise<Client> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const idx = db.clients.findIndex((c) => c.id === id && c.tenantId === tenantId);
    if (idx === -1) throw new Error("Client introuvable");
    db.clients[idx] = { ...db.clients[idx], ...input };
    return db.clients[idx];
  },

  async getOrderHistory(clientId: string): Promise<Order[]> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    return db.orders
      .filter((o) => o.clientId === clientId && o.tenantId === tenantId)
      .sort((a, b) => new Date(b.depositDate).getTime() - new Date(a.depositDate).getTime());
  },
};
