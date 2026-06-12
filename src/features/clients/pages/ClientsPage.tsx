import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFormDialog } from "../components/ClientFormDialog";
import { clientsService } from "../services/clients.service";
import { formatCurrency, formatDate, initials } from "@/lib/format";
import type { Client } from "@/types";

const PAGE_SIZE = 8;

export function ClientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["clients", { search, page, pageSize: PAGE_SIZE }],
    queryFn: () => clientsService.list({ search, page, pageSize: PAGE_SIZE }),
  });

  const totalPages = useMemo(() => (data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1), [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez votre base clients et l'historique de leurs commandes.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nouveau client
        </Button>
      </div>

      <Card className="border-border shadow-elevation-sm">
        <CardHeader className="border-b border-border">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou téléphone…"
              className="pl-9"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Client</th>
                  <th className="px-6 py-3 text-left font-medium">Téléphone</th>
                  <th className="px-6 py-3 text-left font-medium">Inscrit le</th>
                  <th className="px-6 py-3 text-right font-medium">Commandes</th>
                  <th className="px-6 py-3 text-right font-medium">Total dépensé</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-6 py-3"><Skeleton className="h-9 w-40" /></td>
                        <td className="px-6 py-3"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-6 py-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-3 text-right"><Skeleton className="ml-auto h-4 w-10" /></td>
                        <td className="px-6 py-3 text-right"><Skeleton className="ml-auto h-4 w-20" /></td>
                        <td className="px-6 py-3" />
                      </tr>
                    ))
                  : data?.data.map((c) => (
                      <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {initials(c.firstName, c.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{c.firstName} {c.lastName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{c.phone}</td>
                        <td className="px-6 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                        <td className="px-6 py-3 text-right font-medium">{c.ordersCount}</td>
                        <td className="px-6 py-3 text-right font-medium">{formatCurrency(c.totalSpent)}</td>
                        <td className="px-6 py-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                {!isLoading && data?.data.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">Aucun client trouvé.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm">
            <p className="text-muted-foreground">
              {data ? `${data.total} client${data.total > 1 ? "s" : ""}` : "—"}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ClientFormDialog open={open} onOpenChange={setOpen} client={editing} />
    </div>
  );
}
