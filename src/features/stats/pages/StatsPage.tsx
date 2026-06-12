import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, ShoppingBag, Percent, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { statsService } from "../services/stats.service";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_METHOD_LABEL } from "@/constants";
import { StatCard } from "@/features/dashboard/components/StatCard";

const PIE_COLORS = ["oklch(0.546 0.215 262)", "oklch(0.69 0.115 192)", "oklch(0.78 0.16 75)", "oklch(0.71 0.18 150)"];

export function StatsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["stats", "advanced"], queryFn: () => statsService.advanced() });

  if (isLoading || !data) {
    return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-[400px] w-full" /></div>;
  }

  const totalMonthly = data.monthlyRevenue.reduce((s, m) => s + m.revenue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Statistiques avancées</h1>
        <p className="mt-1 text-sm text-muted-foreground">Analyse de la performance sur 6 mois.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenus 6 mois" value={formatCurrency(totalMonthly)} icon={TrendingUp} accent="primary" />
        <StatCard label="Panier moyen" value={formatCurrency(Math.round(data.averageBasket))} icon={ShoppingBag} accent="info" />
        <StatCard label="Taux de retrait" value={`${data.pickupRate.toFixed(1)} %`} icon={Percent} accent="success" />
        <StatCard label="Clients actifs" value={String(data.topClients.length)} icon={Users} accent="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border shadow-elevation-sm lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Revenus mensuels</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                  <XAxis dataKey="month" stroke="oklch(0.46 0.025 257)" fontSize={12} />
                  <YAxis stroke="oklch(0.46 0.025 257)" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 255)" }} />
                  <Bar dataKey="revenue" fill="oklch(0.546 0.215 262)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elevation-sm">
          <CardHeader><CardTitle className="text-base">Méthodes de paiement</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.revenueByMethod.map((r) => ({ name: PAYMENT_METHOD_LABEL[r.method], value: r.amount }))}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {data.revenueByMethod.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border shadow-elevation-sm">
          <CardHeader><CardTitle className="text-base">Top clients</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-y border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-6 py-2.5 text-left font-medium">Client</th><th className="px-6 py-2.5 text-right font-medium">Cmd.</th><th className="px-6 py-2.5 text-right font-medium">CA</th></tr>
              </thead>
              <tbody>
                {data.topClients.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-3 font-medium">{c.name}</td>
                    <td className="px-6 py-3 text-right text-muted-foreground">{c.orders}</td>
                    <td className="px-6 py-3 text-right font-semibold">{formatCurrency(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elevation-sm">
          <CardHeader><CardTitle className="text-base">Articles les plus rentables</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-y border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-6 py-2.5 text-left font-medium">Article</th><th className="px-6 py-2.5 text-right font-medium">Qté</th><th className="px-6 py-2.5 text-right font-medium">CA</th></tr>
              </thead>
              <tbody>
                {data.topItems.map((it) => (
                  <tr key={it.label} className="border-b border-border last:border-0">
                    <td className="px-6 py-3 font-medium">{it.label}</td>
                    <td className="px-6 py-3 text-right text-muted-foreground">{it.quantity}</td>
                    <td className="px-6 py-3 text-right font-semibold">{formatCurrency(it.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
