import { scoped, requireTenant } from "@/lib/mock-db";
import { getActiveTenantId } from "@/store/tenant.store";
import type { AdvancedStats, PaymentMethod, RevenueByMethod } from "@/types";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const statsService = {
  async advanced(): Promise<AdvancedStats> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const orders = scoped.orders(tenantId);
    const clients = scoped.clients(tenantId);

    const months: { month: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      let revenue = 0;
      orders.forEach((o) => o.payments.forEach((p) => {
        const pd = new Date(p.date);
        if (pd >= d && pd < next) revenue += p.amount;
      }));
      months.push({ month: d.toLocaleDateString("fr-FR", { month: "short" }), revenue });
    }

    const topClients = clients
      .map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, total: c.totalSpent, orders: c.ordersCount }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const itemMap = new Map<string, { quantity: number; revenue: number }>();
    orders.forEach((o) => o.items.forEach((it) => {
      const cur = itemMap.get(it.label) ?? { quantity: 0, revenue: 0 };
      cur.quantity += it.quantity;
      cur.revenue += it.quantity * it.unitPrice;
      itemMap.set(it.label, cur);
    }));
    const topItems = Array.from(itemMap.entries())
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const methodMap = new Map<PaymentMethod, number>();
    orders.forEach((o) => o.payments.forEach((p) => {
      methodMap.set(p.method, (methodMap.get(p.method) ?? 0) + p.amount);
    }));
    const revenueByMethod: RevenueByMethod[] = Array.from(methodMap.entries()).map(([method, amount]) => ({ method, amount }));

    const totalRev = orders.reduce((s, o) => s + o.paid, 0);
    const ordersCount = orders.length;
    const averageBasket = ordersCount ? totalRev / ordersCount : 0;
    const pickedUp = orders.filter((o) => o.status === "picked_up").length;
    const pickupRate = ordersCount ? (pickedUp / ordersCount) * 100 : 0;

    return { monthlyRevenue: months, topClients, topItems, revenueByMethod, averageBasket, pickupRate };
  },
};
