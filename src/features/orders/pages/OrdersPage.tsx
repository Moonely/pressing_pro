import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ordersService } from "../services/orders.service";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/constants";
import type { OrderStatus } from "@/types";

const PAGE_SIZE = 10;
const STATUS_OPTIONS: (OrderStatus | "all")[] = ["all", "deposited", "in_progress", "ready", "picked_up", "cancelled"];

export function OrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", { search, status, page, pageSize: PAGE_SIZE }],
    queryFn: () => ordersService.list({ search, status, page, pageSize: PAGE_SIZE }),
  });

  const totalPages = useMemo(() => (data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1), [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commandes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez l'état de toutes les commandes en cours et passées.
          </p>
        </div>
        <Button onClick={() => navigate("/orders/new")} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nouvelle commande
        </Button>
      </div>

      <Card className="border-border shadow-elevation-sm">
        <CardHeader className="border-b border-border">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Référence, client, téléphone…"
                className="pl-9"
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              />
            </div>
            <Select value={status} onValueChange={(v) => { setPage(1); setStatus(v as OrderStatus | "all"); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "Tous les statuts" : ORDER_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Référence</th>
                  <th className="px-6 py-3 text-left font-medium">Client</th>
                  <th className="px-6 py-3 text-left font-medium">Dépôt</th>
                  <th className="px-6 py-3 text-left font-medium">Statut</th>
                  <th className="px-6 py-3 text-right font-medium">Total</th>
                  <th className="px-6 py-3 text-right font-medium">Payé</th>
                  <th className="px-6 py-3 text-right font-medium">Reste</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-t border-border">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-6 py-3"><Skeleton className="h-4 w-20" /></td>
                        ))}
                      </tr>
                    ))
                  : data?.data.map((o) => {
                      const remaining = o.total - o.paid;
                      return (
                        <tr key={o.id} className="cursor-pointer border-t border-border hover:bg-muted/30" onClick={() => navigate(`/orders/${o.id}`)}>
                          <td className="px-6 py-3 font-medium">
                            <Link to={`/orders/${o.id}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                              {o.reference}
                            </Link>
                          </td>
                          <td className="px-6 py-3">
                            <p className="font-medium">{o.client?.firstName} {o.client?.lastName}</p>
                            <p className="text-xs text-muted-foreground">{o.client?.phone}</p>
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">{formatDateTime(o.depositDate)}</td>
                          <td className="px-6 py-3"><OrderStatusBadge status={o.status} /></td>
                          <td className="px-6 py-3 text-right font-medium">{formatCurrency(o.total)}</td>
                          <td className="px-6 py-3 text-right text-success">{formatCurrency(o.paid)}</td>
                          <td className="px-6 py-3 text-right">
                            <span className={remaining > 0 ? "font-medium text-warning" : "text-muted-foreground"}>
                              {formatCurrency(remaining)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                {!isLoading && data?.data.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">Aucune commande trouvée.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm">
            <p className="text-muted-foreground">
              {data ? `${data.total} commande${data.total > 1 ? "s" : ""}` : "—"}
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
    </div>
  );
}
