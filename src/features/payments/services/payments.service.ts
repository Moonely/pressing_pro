import { db, genId, scoped, requireTenant } from "@/lib/mock-db";
import { getActiveTenantId } from "@/store/tenant.store";
import type { Paginated, Payment, PaymentMethod, PaymentRow } from "@/types";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export interface AddPaymentInput {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}

export const paymentsService = {
  async list(params: { search?: string; method?: PaymentMethod | "all"; page?: number; pageSize?: number } = {}): Promise<Paginated<PaymentRow>> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const { search = "", method = "all", page = 1, pageSize = 12 } = params;
    const q = search.trim().toLowerCase();
    const rows: PaymentRow[] = [];
    scoped.orders(tenantId).forEach((o) => {
      o.payments.forEach((p) => {
        rows.push({
          ...p, orderId: o.id, orderRef: o.reference,
          clientName: `${o.client?.firstName ?? ""} ${o.client?.lastName ?? ""}`.trim(),
        });
      });
    });
    let filtered = rows;
    if (method !== "all") filtered = filtered.filter((r) => r.method === method);
    if (q) {
      filtered = filtered.filter(
        (r) => r.orderRef.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q),
      );
    }
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const start = (page - 1) * pageSize;
    return { data: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize };
  },

  async add(input: AddPaymentInput): Promise<Payment> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const order = db.orders.find((o) => o.id === input.orderId && o.tenantId === tenantId);
    if (!order) throw new Error("Commande introuvable");
    const remaining = order.total - order.paid;
    if (input.amount <= 0) throw new Error("Montant invalide");
    if (input.amount > remaining) throw new Error("Montant supérieur au reste à payer");
    const payment: Payment = {
      id: genId("pay"), amount: input.amount, method: input.method,
      date: new Date().toISOString(),
    };
    order.payments.push(payment);
    order.paid += input.amount;
    const client = db.clients.find((c) => c.id === order.clientId && c.tenantId === tenantId);
    if (client) client.totalSpent += input.amount;
    return payment;
  },

  async summary(): Promise<{ today: number; week: number; month: number; pending: number }> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let today = 0, week = 0, month = 0;
    scoped.orders(tenantId).forEach((o) => o.payments.forEach((p) => {
      const d = new Date(p.date);
      if (d >= startOfDay) today += p.amount;
      if (d >= startOfWeek) week += p.amount;
      if (d >= startOfMonth) month += p.amount;
    }));
    const pending = scoped.orders(tenantId).reduce((s, o) => s + Math.max(0, o.total - o.paid), 0);
    return { today, week, month, pending };
  },
};
