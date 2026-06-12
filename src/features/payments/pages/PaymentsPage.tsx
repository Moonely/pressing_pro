import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Wallet, TrendingUp, Hourglass, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { paymentsService } from "../services/payments.service";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { PAYMENT_METHOD_LABEL } from "@/constants";
import { StatCard } from "@/features/dashboard/components/StatCard";
import type { PaymentMethod } from "@/types";

export function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "all">("all");
  const [page, setPage] = useState(1);

  const { data: summary } = useQuery({
    queryKey: ["payments", "summary"],
    queryFn: () => paymentsService.summary(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["payments", "list", search, method, page],
    queryFn: () => paymentsService.list({ search, method, page, pageSize: 12 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paiements</h1>
        <p className="mt-1 text-sm text-muted-foreground">Suivi des encaissements et impayés.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Aujourd'hui" value={formatCurrency(summary?.today ?? 0)} icon={Wallet} accent="success" />
        <StatCard label="7 derniers jours" value={formatCurrency(summary?.week ?? 0)} icon={TrendingUp} accent="info" />
        <StatCard label="Ce mois" value={formatCurrency(summary?.month ?? 0)} icon={CalendarDays} accent="primary" />
        <StatCard label="Reste à encaisser" value={formatCurrency(summary?.pending ?? 0)} icon={Hourglass} accent="warning" />
      </div>

      <Card className="border-border shadow-elevation-sm">
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Historique</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Référence ou client…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 sm:w-[260px]"
              />
            </div>
            <Select value={method} onValueChange={(v) => { setMethod(v as PaymentMethod | "all"); setPage(1); }}>
              <SelectTrigger className="sm:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes méthodes</SelectItem>
                {Object.entries(PAYMENT_METHOD_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-y border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-2.5 text-left font-medium">Date</th>
                <th className="px-6 py-2.5 text-left font-medium">Commande</th>
                <th className="px-6 py-2.5 text-left font-medium">Client</th>
                <th className="px-6 py-2.5 text-left font-medium">Méthode</th>
                <th className="px-6 py-2.5 text-right font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border"><td colSpan={5} className="px-6 py-3"><Skeleton className="h-4 w-full" /></td></tr>
              ))}
              {!isLoading && data?.data.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-3 text-muted-foreground">{formatDateTime(p.date)}</td>
                  <td className="px-6 py-3 font-medium">{p.orderRef}</td>
                  <td className="px-6 py-3">{p.clientName}</td>
                  <td className="px-6 py-3">{PAYMENT_METHOD_LABEL[p.method]}</td>
                  <td className="px-6 py-3 text-right font-semibold text-success">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
              {!isLoading && data?.data.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Aucun paiement trouvé.</td></tr>
              )}
            </tbody>
          </table>
          {data && data.total > data.pageSize && (
            <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm text-muted-foreground">
              <span>Page {page} / {Math.ceil(data.total / data.pageSize)}</span>
              <div className="flex gap-2">
                <button className="rounded border border-border px-3 py-1 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Précédent</button>
                <button className="rounded border border-border px-3 py-1 disabled:opacity-50" onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(data.total / data.pageSize)}>Suivant</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
