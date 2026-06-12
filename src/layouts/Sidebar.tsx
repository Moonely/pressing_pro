import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingBag, Wallet, WashingMachine, BarChart3, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import { Logo } from "@/components/branding/Logo";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/rbac";
import type { Role } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end: boolean;
  permission?: Permission;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/clients", label: "Clients", icon: Users, end: false, permission: "client:read" },
  { to: "/orders", label: "Commandes", icon: ShoppingBag, end: false, permission: "order:read" },
  { to: "/payments", label: "Paiements", icon: Wallet, end: false, permission: "payment:read" },
  { to: "/machines", label: "Machines", icon: WashingMachine, end: false, permission: "machine:read" },
  { to: "/stats", label: "Statistiques", icon: BarChart3, end: false, permission: "stats:read" },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin/tenants", label: "Tenants", icon: Building2, end: false, roles: ["SUPER_ADMIN"] },
];

export function Sidebar() {
  const { can, is } = usePermissions();
  const items = NAV.filter((i) => !i.permission || can(i.permission));
  const adminItems = ADMIN_NAV.filter((i) => !i.roles || is(i.roles));

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
        <Logo size={36} className="bg-white/10 ring-white/10" />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
          <span className="text-[11px] text-sidebar-muted">SaaS Multi-tenant</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-2 pt-3 text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
          Espace de travail
        </p>
        {items.map((item) => (
          <NavLink
            key={item.to} to={item.to} end={item.end}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-active text-primary-foreground shadow-elevation-sm"
                  : "text-sidebar-foreground/85 hover:bg-white/5 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {adminItems.length > 0 && (
          <>
            <p className="px-3 pb-2 pt-5 text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
              Plateforme
            </p>
            {adminItems.map((item) => (
              <NavLink
                key={item.to} to={item.to} end={item.end}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-active text-primary-foreground shadow-elevation-sm"
                      : "text-sidebar-foreground/85 hover:bg-white/5 hover:text-sidebar-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        
      </div>
    </aside>
  );
}
