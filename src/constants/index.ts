import type { OrderStatus, PaymentMethod, Role } from "@/types";

export const APP_NAME = "PressingPro";
export const CURRENCY = "FCFA";

export const ROUTES = {
  login: "/login",
  dashboard: "/",
  clients: "/clients",
  orders: "/orders",
  orderDetail: (id: string) => `/orders/${id}`,
  newOrder: "/orders/new",
  payments: "/payments",
  machines: "/machines",
  stats: "/stats",
  tenants: "/admin/tenants",
  forbidden: "/403",
} as const;

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  deposited: "Déposé",
  in_progress: "En cours",
  ready: "Prêt",
  picked_up: "Récupéré",
  cancelled: "Annulé",
};

export const ORDER_STATUS_VARIANT: Record<
  OrderStatus,
  "info" | "warning" | "success" | "muted" | "destructive"
> = {
  deposited: "info",
  in_progress: "warning",
  ready: "success",
  picked_up: "muted",
  cancelled: "destructive",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Espèces",
  mobile_money: "Mobile Money",
  card: "Carte bancaire",
};

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  TENANT_ADMIN: "Administrateur",
  EMPLOYEE: "Employé",
};

export const STORAGE_KEYS = {
  session: "pressingpro.session",
  tenant: "pressingpro.tenant",
} as const;

/** Hosts that are NOT tenant sub-domains (no resolution from host). */
export const RESERVED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "app",
  "www",
  "admin",
  "lovable.app",
  "lovable.dev",
]);

export const TENANT_HEADER = "X-Tenant-Id";
