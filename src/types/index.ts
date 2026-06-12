// ============================================================
// Multi-tenant SaaS types — aligned with NestJS + Prisma backend
// ============================================================

export type Role = "SUPER_ADMIN" | "TENANT_ADMIN" | "EMPLOYEE";

export interface Tenant {
  id: string;
  slug: string; // sub-domain key, e.g. "pressing-dakar"
  name: string;
  plan: "starter" | "pro" | "enterprise";
  currency: string;
  createdAt: string;
  active: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  /** null for SUPER_ADMIN — they pick a tenant at runtime */
  tenantId: string | null;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  /** Tenants this user may access. SUPER_ADMIN gets all; others one. */
  tenants: Tenant[];
}

/** Decoded JWT shape (front-end contract with backend). */
export interface JwtClaims {
  sub: string;
  email: string;
  role: Role;
  tenantId: string | null;
  iat: number;
  exp: number;
}

// -------------------- Tenant-scoped domain --------------------

export interface TenantScoped {
  tenantId: string;
}

export interface Client extends TenantScoped {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
}

export type OrderStatus =
  | "deposited"
  | "in_progress"
  | "ready"
  | "picked_up"
  | "cancelled";

export type PaymentMethod = "cash" | "mobile_money" | "card";

export interface OrderItem {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string;
}

export interface Order extends TenantScoped {
  id: string;
  reference: string;
  clientId: string;
  client?: Pick<Client, "id" | "firstName" | "lastName" | "phone">;
  items: OrderItem[];
  status: OrderStatus;
  depositDate: string;
  pickupDate?: string;
  total: number;
  paid: number;
  payments: Payment[];
  notes?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type MachineType = "washer" | "dryer" | "iron";
export type MachineStatus = "idle" | "running" | "maintenance";

export interface MachineCycle {
  id: string;
  machineId: string;
  orderId?: string;
  orderRef?: string;
  startedAt: string;
  endsAt: string;
  program: string;
}

export interface Machine extends TenantScoped {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  capacityKg: number;
  currentCycle?: MachineCycle;
  totalCycles: number;
}

export interface RevenueByMethod {
  method: PaymentMethod;
  amount: number;
}

export interface PaymentRow extends Payment {
  orderId: string;
  orderRef: string;
  clientName: string;
}

export interface AdvancedStats {
  monthlyRevenue: { month: string; revenue: number }[];
  topClients: { id: string; name: string; total: number; orders: number }[];
  topItems: { label: string; quantity: number; revenue: number }[];
  revenueByMethod: RevenueByMethod[];
  averageBasket: number;
  pickupRate: number;
}

export interface DashboardStats {
  todayRevenue: number;
  ordersInProgress: number;
  ordersPickedUpToday: number;
  partialPayments: number;
  weeklyRevenue: { day: string; revenue: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
}
