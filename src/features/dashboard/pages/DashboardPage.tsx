import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Banknote,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "../components/StatCard";
import { dashboardService } from "../services/dashboard.service";
import { ordersService } from "@/features/orders/services/orders.service";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/constants";

const STATUS_COLORS: Record<string, string> = {
  deposited: "oklch(0.65 0.16 240)",
  in_progress: "oklch(0.78 0.16 75)",
  ready: "oklch(0.71 0.18 150)",
  picked_up: "oklch(0.6 0.02 257)",
  cancelled: "oklch(0.62 0.235 25)",
};

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["orders", { recent: true }],
    queryFn: () => ordersService.list({ pageSize: 6 }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vue d'ensemble de l'activité du jour.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[116px] rounded-lg" />
          ))
        ) : (
          <>
            <StatCard label="CA du jour" value={formatCurrency(stats.todayRevenue)} hint="Encaissements" icon={Banknote} accent="primary" />
            <StatCard label="En cours" value={String(stats.ordersInProgress)} hint="Commandes actives" icon={Clock} accent="warning" />
            <StatCard label="Récupérées" value={String(stats.ordersPickedUpToday)} hint="Aujourd'hui" icon={CheckCircle2} accent="success" />
            <StatCard label="Paiements partiels" value={String(stats.partialPayments)} hint="Reste à payer" icon={AlertCircle} accent="info" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border shadow-elevation-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chiffre d'affaires (7 jours)</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[260px] w-full">
              {stats && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklyRevenue} margin={{ top: 8, right: 10, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.546 0.215 262)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="oklch(0.546 0.215 262)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" vertical={false} />
                    <XAxis dataKey="day" stroke="oklch(0.46 0.025 257)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.46 0.025 257)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip
                      cursor={{ stroke: "oklch(0.546 0.215 262 / 0.2)" }}
                      contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 255)", fontSize: 12 }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="oklch(0.546 0.215 262)" strokeWidth={2} fill="url(#rev)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elevation-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Répartition par statut</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[260px] w-full">
              {stats && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ordersByStatus} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" horizontal={false} />
                    <XAxis type="number" stroke="oklch(0.46 0.025 257)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="status"
                      stroke="oklch(0.46 0.025 257)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                      tickFormatter={(v: string) => ORDER_STATUS_LABEL[v as keyof typeof ORDER_STATUS_LABEL]}
                    />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 255)", fontSize: 12 }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {stats.ordersByStatus.map((s) => (
                        <Cell key={s.status} fill={STATUS_COLORS[s.status]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-elevation-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Commandes récentes</CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link to="/orders">
              Tout voir <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-2.5 text-left font-medium">Référence</th>
                  <th className="px-6 py-2.5 text-left font-medium">Client</th>
                  <th className="px-6 py-2.5 text-left font-medium">Dépôt</th>
                  <th className="px-6 py-2.5 text-left font-medium">Statut</th>
                  <th className="px-6 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.data.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-3 font-medium">
                      <Link to={`/orders/${o.id}`} className="text-primary hover:underline">{o.reference}</Link>
                    </td>
                    <td className="px-6 py-3">{o.client?.firstName} {o.client?.lastName}</td>
                    <td className="px-6 py-3 text-muted-foreground">{formatDateTime(o.depositDate)}</td>
                    <td className="px-6 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-6 py-3 text-right font-medium">{formatCurrency(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
