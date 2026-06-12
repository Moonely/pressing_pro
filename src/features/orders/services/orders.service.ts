import { db, genId, nextOrderRef, scoped, requireTenant } from "@/lib/mock-db";
import { getActiveTenantId } from "@/store/tenant.store";
import type { Order, OrderStatus, Paginated } from "@/types";
import type { OrderInput } from "../schemas/order.schema";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const ordersService = {
  async list(params: { search?: string; status?: OrderStatus | "all"; page?: number; pageSize?: number } = {}): Promise<Paginated<Order>> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const { search = "", status = "all", page = 1, pageSize = 10 } = params;
    const q = search.trim().toLowerCase();
    let filtered = scoped.orders(tenantId);
    if (status !== "all") filtered = filtered.filter((o) => o.status === status);
    if (q) {
      filtered = filtered.filter((o) => {
        const c = o.client;
        return (
          o.reference.toLowerCase().includes(q) ||
          c?.firstName.toLowerCase().includes(q) ||
          c?.lastName.toLowerCase().includes(q) ||
          c?.phone.toLowerCase().includes(q)
        );
      });
    }
    const sorted = filtered.sort(
      (a, b) => new Date(b.depositDate).getTime() - new Date(a.depositDate).getTime()
    );
    const start = (page - 1) * pageSize;
    return { data: sorted.slice(start, start + pageSize), total: sorted.length, page, pageSize };
  },

  async getById(id: string): Promise<Order> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const o = db.orders.find((x) => x.id === id && x.tenantId === tenantId);
    if (!o) throw new Error("Commande introuvable");
    return o;
  },

  async create(input: OrderInput): Promise<Order> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const client = db.clients.find((c) => c.id === input.clientId && c.tenantId === tenantId);
    if (!client) throw new Error("Client introuvable");
    const items = input.items.map((it) => ({ id: genId("itm"), ...it }));
    const total = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    const order: Order = {
      id: genId("ord"),
      tenantId,
      reference: nextOrderRef(tenantId),
      clientId: client.id,
      client: { id: client.id, firstName: client.firstName, lastName: client.lastName, phone: client.phone },
      items, status: "deposited",
      depositDate: new Date().toISOString(),
      total, paid: 0, payments: [],
      notes: input.notes,
    };
    db.orders.unshift(order);
    client.ordersCount += 1;
    return order;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const o = db.orders.find((x) => x.id === id && x.tenantId === tenantId);
    if (!o) throw new Error("Commande introuvable");
    o.status = status;
    if (status === "picked_up" && !o.pickupDate) o.pickupDate = new Date().toISOString();
    return o;
  },
};
