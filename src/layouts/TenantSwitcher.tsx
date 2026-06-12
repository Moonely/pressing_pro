import { Building2, ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTenant } from "@/hooks/useTenant";
import { usePermissions } from "@/hooks/usePermissions";

export function TenantSwitcher() {
  const { tenant, tenants, setTenant } = useTenant();
  const { is } = usePermissions();
  const canSwitch = is("SUPER_ADMIN") || tenants.length > 1;

  if (!tenant) {
    return (
      <div className="hidden items-center gap-2 rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground md:flex">
        <Building2 className="h-3.5 w-3.5" />
        Aucun tenant
      </div>
    );
  }

  const trigger = (
    <Button variant="outline" size="sm" className="h-9 gap-2 font-normal">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span className="max-w-[160px] truncate">{tenant.name}</span>
      {canSwitch && <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />}
    </Button>
  );

  if (!canSwitch) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs">Changer de pressing</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((t) => (
          <DropdownMenuItem key={t.id} onClick={() => setTenant(t)} className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm">{t.name}</span>
              <span className="text-[11px] text-muted-foreground">{t.slug} · {t.plan}</span>
            </div>
            {tenant.id === t.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
