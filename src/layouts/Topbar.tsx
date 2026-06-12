import { LogOut, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth.store";
import { useTenantStore } from "@/store/tenant.store";
import { initials } from "@/lib/format";
import { ROLE_LABEL } from "@/constants";
import { TenantSwitcher } from "./TenantSwitcher";
import { usePermissions } from "@/hooks/usePermissions";

export function Topbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const resetTenant = useTenantStore((s) => s.reset);
  const { can } = usePermissions();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-8">
      <TenantSwitcher />
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher commande, client…" className="h-9 pl-9" />
      </div>
      <div className="flex-1 md:hidden" />
      {can("order:write") && (
        <Button onClick={() => navigate("/orders/new")} className="h-9 gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nouvelle commande</span>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {user ? initials(user.firstName, user.lastName) : "?"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <span className="mt-1 inline-block rounded bg-accent px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-accent-foreground">
              {user ? ROLE_LABEL[user.role] : ""}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { logout(); resetTenant(); navigate("/login"); }}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
