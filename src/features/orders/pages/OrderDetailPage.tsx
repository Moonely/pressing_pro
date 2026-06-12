import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ordersService } from "../services/orders.service";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/constants";
import type { OrderStatus } from "@/types";
import { AddPaymentDialog } from "@/features/payments/components/AddPaymentDialog";
import { downloadOrderTicket, printOrderTicket } from "../utils/ticket-pdf";

const STATUS_FLOW: OrderStatus[] = ["deposited", "in_progress", "ready", "picked_up", "cancelled"];

export function OrderDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [payOpen, setPayOpen] = useState(false);
  void navigate;

  const { data: order, isLoading } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersService.getById(id),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Statut mis à jour");
    },
    onError: () => toast.error("Échec de la mise à jour"),
  });

  if (isLoading || !order) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const remaining = order.total - order.paid;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 gap-1 text-muted-foreground">
            <Link to="/orders"><ArrowLeft className="h-4 w-4" /> Retour</Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{order.reference}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Déposée le {formatDateTime(order.depositDate)}
            {order.pickupDate && ` · Récupérée le ${formatDateTime(order.pickupDate)}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => printOrderTicket(order)}>
            <Printer className="mr-2 h-4 w-4" /> Imprimer
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadOrderTicket(order)}>
            <Download className="mr-2 h-4 w-4" /> Ticket PDF
          </Button>
          {remaining > 0 && (
            <Button size="sm" onClick={() => setPayOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Encaisser
            </Button>
          )}
          <Select
            value={order.status}
            onValueChange={(v) => statusMutation.mutate(v as OrderStatus)}
            disabled={statusMutation.isPending}
          >
            <SelectTrigger className="w-[180px]">
              {statusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}
            </SelectTrigger>
            <SelectContent>
              {STATUS_FLOW.map((s) => (
                <SelectItem key={s} value={s}>{ORDER_STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border shadow-elevation-sm lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Articles</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-y border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-2.5 text-left font-medium">Article</th>
                  <th className="px-6 py-2.5 text-right font-medium">Qté</th>
                  <th className="px-6 py-2.5 text-right font-medium">Prix unitaire</th>
                  <th className="px-6 py-2.5 text-right font-medium">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-3 font-medium">{it.label}</td>
                    <td className="px-6 py-3 text-right">{it.quantity}</td>
                    <td className="px-6 py-3 text-right text-muted-foreground">{formatCurrency(it.unitPrice)}</td>
                    <td className="px-6 py-3 text-right font-medium">{formatCurrency(it.unitPrice * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/40">
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium">Total</td>
                  <td className="px-6 py-3 text-right text-base font-bold">{formatCurrency(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border shadow-elevation-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Client</CardTitle></CardHeader>
            <CardContent>
              <p className="font-medium">{order.client?.firstName} {order.client?.lastName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{order.client?.phone}</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-elevation-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Paiement</CardTitle></CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payé</span>
                <span className="font-medium text-success">{formatCurrency(order.paid)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5">
                <span className="font-medium">Reste à payer</span>
                <span className={`font-bold ${remaining > 0 ? "text-warning" : "text-success"}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
              {order.payments.length > 0 && (
                <div className="space-y-1.5 border-t border-border pt-2.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Historique</p>
                  {order.payments.map((p) => (
                    <div key={p.id} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{formatDateTime(p.date)} · {PAYMENT_METHOD_LABEL[p.method]}</span>
                      <span className="font-medium">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddPaymentDialog open={payOpen} onOpenChange={setPayOpen} orderId={order.id} remaining={remaining} />
    </div>
  );
}
