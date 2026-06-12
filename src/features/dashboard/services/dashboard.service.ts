import { scoped, requireTenant } from "@/lib/mock-db";
import { getActiveTenantId } from "@/store/tenant.store";
import type { DashboardStats, OrderStatus } from "@/types";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const STATUSES: OrderStatus[] = ["deposited", "in_progress", "ready", "picked_up", "cancelled"];

function isToday(iso: string): boolean {
  const d = new Date(iso); const t = new Date();
  return d.toDateString() === t.toDateString();
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    await delay();
    const tenantId = requireTenant(getActiveTenantId());
    const orders = scoped.orders(tenantId);

    const todayRevenue = orders.flatMap((o) => o.payments).filter((p) => isToday(p.date))
      .reduce((s, p) => s + p.amount, 0);
    const ordersInProgress = orders.filter(
      (o) => o.status === "in_progress" || o.status === "deposited" || o.status === "ready"
    ).length;
    const ordersPickedUpToday = orders.filter(
      (o) => o.status === "picked_up" && o.pickupDate && isToday(o.pickupDate)
    ).length;
    const partialPayments = orders.filter((o) => o.paid > 0 && o.paid < o.total).length;

    const weeklyRevenue = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const key = d.toDateString();
      const revenue = orders.flatMap((o) => o.payments)
        .filter((p) => new Date(p.date).toDateString() === key)
        .reduce((s, p) => s + p.amount, 0);
      return { day: new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(d), revenue };
    });

    const ordersByStatus = STATUSES.map((status) => ({
      status, count: orders.filter((o) => o.status === status).length,
    }));

    return { todayRevenue, ordersInProgress, ordersPickedUpToday, partialPayments, weeklyRevenue, ordersByStatus };
  },
};
