import { useQuery } from "@tanstack/react-query";
import { Building2, Check, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tenantsService } from "../services/tenants.service";
import { useTenantStore } from "@/store/tenant.store";

export function TenantsAdminPage() {
  const { data, isLoading } = useQuery({ queryKey: ["tenants"], queryFn: tenantsService.list });
  const current = useTenantStore((s) => s.current);
  const setCurrent = useTenantStore((s) => s.setCurrent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
        <p className="text-sm text-muted-foreground">
          Administration des pressings de la plateforme.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Pressing</th>
              <th className="px-4 py-3">Slug / sous-domaine</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Chargement…</td></tr>
            )}
            {data?.map((t) => (
              <tr key={t.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{t.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.slug}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="capitalize">{t.plan}</Badge>
                </td>
                <td className="px-4 py-3">
                  {t.active
                    ? <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">Actif</Badge>
                    : <Badge variant="destructive">Suspendu</Badge>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant={current?.id === t.id ? "secondary" : "outline"}
                      onClick={() => setCurrent(t)}
                    >
                      {current?.id === t.id ? <><Check className="mr-1.5 h-3.5 w-3.5" /> Actif</> : "Sélectionner"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => tenantsService.toggleActive(t.id)}>
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
