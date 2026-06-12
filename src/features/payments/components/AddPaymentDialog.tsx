import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paymentsService } from "../services/payments.service";
import { PAYMENT_METHOD_LABEL } from "@/constants";
import type { PaymentMethod } from "@/types";
import { formatCurrency } from "@/lib/format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  remaining: number;
}

export function AddPaymentDialog({ open, onOpenChange, orderId, remaining }: Props) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState<string>(String(remaining));
  const [method, setMethod] = useState<PaymentMethod>("cash");

  const mutation = useMutation({
    mutationFn: () => paymentsService.add({ orderId, amount: Number(amount), method }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Paiement enregistré");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Encaisser un paiement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md bg-muted/60 p-3 text-sm">
            Reste à payer : <span className="font-semibold">{formatCurrency(remaining)}</span>
          </div>
          <div className="space-y-2">
            <Label>Montant</Label>
            <Input type="number" min={0} max={remaining} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Méthode</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || remaining <= 0}>
            Encaisser
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
