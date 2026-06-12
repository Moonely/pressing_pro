/**
 * In-memory mock database — multi-tenant.
 * Drop-in replaceable by NestJS REST API via VITE_API_URL.
 * All collections carry a `tenantId`. Use `scoped.*(tenantId)` accessors.
 */
import type { Client, Machine, MachineCycle, Order, OrderStatus, Payment, Tenant } from "@/types";

const FIRST_NAMES = ["Awa", "Mamadou", "Fatou", "Ibrahim", "Aïcha", "Moussa", "Salimata", "Ousmane", "Khadija", "Cheikh", "Nafissatou", "Abdoulaye"];
const LAST_NAMES = ["Diop", "Ndiaye", "Sow", "Ba", "Fall", "Sarr", "Cissé", "Diallo", "Touré", "Kane", "Faye", "Mbaye"];
const ITEMS = [
  { label: "Chemise", price: 1500 },
  { label: "Pantalon", price: 2000 },
  { label: "Costume 2 pièces", price: 6000 },
  { label: "Robe", price: 3500 },
  { label: "Boubou", price: 5000 },
  { label: "Veste", price: 3000 },
  { label: "Couverture", price: 4500 },
  { label: "Rideaux (m²)", price: 1200 },
];

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
}

// -------------------- Tenants --------------------
const tenants: Tenant[] = [
  { id: "tnt_dakar", slug: "pressing-dakar", name: "Pressing Dakar Centre", plan: "pro",
    currency: "FCFA", createdAt: daysAgo(200), active: true },
  { id: "tnt_thies", slug: "pressing-thies", name: "Pressing Thiès Excellence", plan: "starter",
    currency: "FCFA", createdAt: daysAgo(80), active: true },
  { id: "tnt_abidjan", slug: "pressing-abidjan", name: "Abidjan Royal Pressing", plan: "enterprise",
    currency: "FCFA", createdAt: daysAgo(420), active: true },
];

// -------------------- Clients --------------------
const clients: Client[] = [];
tenants.forEach((t, ti) => {
  const count = [16, 8, 12][ti] ?? 10;
  for (let i = 0; i < count; i++) {
    clients.push({
      id: uid("cli"),
      tenantId: t.id,
      firstName: FIRST_NAMES[(i + ti) % FIRST_NAMES.length],
      lastName: LAST_NAMES[(i + ti * 3) % LAST_NAMES.length],
      phone: `+221 7${Math.floor(Math.random() * 9)} ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 90) + 10)} ${String(Math.floor(Math.random() * 90) + 10)}`,
      createdAt: daysAgo(Math.floor(Math.random() * 120)),
      ordersCount: 0,
      totalSpent: 0,
    });
  }
});

// -------------------- Orders --------------------
const STATUSES: OrderStatus[] = ["deposited", "in_progress", "ready", "picked_up", "picked_up", "cancelled"];
const orderCounters: Record<string, number> = {};
tenants.forEach((t) => (orderCounters[t.id] = 1000));

const orders: Order[] = [];
tenants.forEach((t) => {
  const tenantClients = clients.filter((c) => c.tenantId === t.id);
  const count = Math.max(12, tenantClients.length * 2);
  for (let i = 0; i < count; i++) {
    const client = pick(tenantClients);
    const itemCount = 1 + Math.floor(Math.random() * 4);
    const items = Array.from({ length: itemCount }).map(() => {
      const it = pick(ITEMS);
      return { id: uid("itm"), label: it.label, quantity: 1 + Math.floor(Math.random() * 3), unitPrice: it.price };
    });
    const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const status = pick(STATUSES);
    const isPaid = status === "picked_up" || Math.random() > 0.4;
    const paid = isPaid ? total : Math.round(total * (Math.random() * 0.7));
    const payments: Payment[] = paid > 0
      ? [{ id: uid("pay"), amount: paid, method: pick(["cash", "mobile_money", "card"] as const), date: daysAgo(Math.floor(Math.random() * 8)) }]
      : [];
    const order: Order = {
      id: uid("ord"),
      tenantId: t.id,
      reference: `${t.slug.slice(0, 3).toUpperCase()}-${++orderCounters[t.id]}`,
      clientId: client.id,
      client: { id: client.id, firstName: client.firstName, lastName: client.lastName, phone: client.phone },
      items, status,
      depositDate: daysAgo(Math.floor(Math.random() * 14)),
      pickupDate: status === "picked_up" ? daysAgo(Math.floor(Math.random() * 4)) : undefined,
      total, paid, payments,
    };
    client.ordersCount += 1;
    client.totalSpent += paid;
    orders.push(order);
  }
});

// -------------------- Machines --------------------
const PROGRAMS = ["Coton 40°", "Synthétique 30°", "Délicat 20°", "Express 15min", "Eco 60°"];
const machines: Machine[] = [];
tenants.forEach((t) => {
  const set: Omit<Machine, "tenantId">[] = [
    { id: uid("mch"), name: "Machine A1", type: "washer", status: "running", capacityKg: 8, totalCycles: 248 },
    { id: uid("mch"), name: "Machine A2", type: "washer", status: "idle", capacityKg: 8, totalCycles: 192 },
    { id: uid("mch"), name: "Sèche-linge S1", type: "dryer", status: "idle", capacityKg: 10, totalCycles: 156 },
    { id: uid("mch"), name: "Centrale vapeur", type: "iron", status: "maintenance", capacityKg: 0, totalCycles: 89 },
  ];
  set.forEach((m) => machines.push({ ...m, tenantId: t.id }));
});

machines.forEach((m) => {
  if (m.status === "running") {
    const tenantOrders = orders.filter((o) => o.tenantId === m.tenantId);
    const start = new Date(Date.now() - Math.floor(Math.random() * 30) * 60_000);
    const end = new Date(start.getTime() + (30 + Math.floor(Math.random() * 30)) * 60_000);
    const linkedOrder = tenantOrders[Math.floor(Math.random() * tenantOrders.length)];
    m.currentCycle = {
      id: uid("cyc"), machineId: m.id,
      orderId: linkedOrder?.id, orderRef: linkedOrder?.reference,
      startedAt: start.toISOString(), endsAt: end.toISOString(),
      program: pick(PROGRAMS),
    };
  }
});

export const db = { tenants, clients, orders, machines };

// -------------------- Tenant-scoped accessors --------------------
/**
 * All services MUST go through `scoped.*` and pass the active `tenantId`
 * from `useTenantStore`. This guarantees isolation and mirrors the
 * `WHERE tenant_id = $1` clause Prisma will enforce server-side.
 */
export const scoped = {
  clients: (tenantId: string) => clients.filter((c) => c.tenantId === tenantId),
  orders: (tenantId: string) => orders.filter((o) => o.tenantId === tenantId),
  machines: (tenantId: string) => machines.filter((m) => m.tenantId === tenantId),
};

export function startCycle(tenantId: string, machineId: string, orderId: string | undefined, program: string, durationMin: number): MachineCycle {
  const m = machines.find((x) => x.id === machineId && x.tenantId === tenantId);
  if (!m) throw new Error("Machine introuvable");
  const order = orderId ? orders.find((o) => o.id === orderId && o.tenantId === tenantId) : undefined;
  const start = new Date();
  const end = new Date(start.getTime() + durationMin * 60_000);
  const cycle: MachineCycle = {
    id: uid("cyc"), machineId,
    orderId: order?.id, orderRef: order?.reference,
    startedAt: start.toISOString(), endsAt: end.toISOString(), program,
  };
  m.currentCycle = cycle; m.status = "running"; m.totalCycles += 1;
  return cycle;
}

export function stopCycle(tenantId: string, machineId: string): void {
  const m = machines.find((x) => x.id === machineId && x.tenantId === tenantId);
  if (!m) throw new Error("Machine introuvable");
  m.currentCycle = undefined; m.status = "idle";
}

export function nextOrderRef(tenantId: string): string {
  const t = tenants.find((x) => x.id === tenantId);
  const prefix = t ? t.slug.slice(0, 3).toUpperCase() : "CMD";
  orderCounters[tenantId] = (orderCounters[tenantId] ?? 1000) + 1;
  return `${prefix}-${orderCounters[tenantId]}`;
}

export function genId(prefix: string): string { return uid(prefix); }

/** Helper used by services to assert a tenant is active. */
export function requireTenant(tenantId: string | null | undefined): string {
  if (!tenantId) throw new Error("Aucun tenant actif");
  return tenantId;
}
