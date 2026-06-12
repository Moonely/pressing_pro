import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderSchema, type OrderInput } from "../schemas/order.schema";
import { ordersService } from "../services/orders.service";
import { clientsService } from "@/features/clients/services/clients.service";
import { formatCurrency } from "@/lib/format";

export function NewOrderPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const { data: clients } = useQuery({
    queryKey: ["clients", { all: true }],
    queryFn: () => clientsService.list({ pageSize: 100 }),
  });

  const form = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientId: "",
      items: [{ label: "", quantity: 1, unitPrice: 0 }],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const items = form.watch("items");
  const total = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);

  const mutation = useMutation({
    mutationFn: (input: OrderInput) => ordersService.create(input),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Commande ${order.reference} créée`);
      navigate(`/orders/${order.id}`);
    },
    onError: () => toast.error("Échec de la création"),
    onSettled: () => setSubmitting(false),
  });

  const onSubmit = (values: OrderInput) => {
    setSubmitting(true);
    mutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 gap-1 text-muted-foreground">
          <Link to="/orders"><ArrowLeft className="h-4 w-4" /> Retour</Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Nouvelle commande</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enregistrez le dépôt de vêtements d'un client.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border shadow-elevation-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Client</CardTitle></CardHeader>
            <CardContent>
              <Label htmlFor="client">Sélectionner le client</Label>
              <Select value={form.watch("clientId")} onValueChange={(v) => form.setValue("clientId", v, { shouldValidate: true })}>
                <SelectTrigger id="client" className="mt-1.5">
                  <SelectValue placeholder="Choisir un client…" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.data.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} — {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.clientId && (
                <p className="mt-1.5 text-xs text-destructive">{form.formState.errors.clientId.message}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-elevation-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Articles</CardTitle>
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => append({ label: "", quantity: 1, unitPrice: 0 })}>
                <Plus className="h-3.5 w-3.5" /> Ajouter
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2">
                  <div className="col-span-6">
                    <Input placeholder="Article (ex: Chemise)" {...form.register(`items.${index}.label`)} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min={1} placeholder="Qté" {...form.register(`items.${index}.quantity`)} />
                  </div>
                  <div className="col-span-3">
                    <Input type="number" min={0} placeholder="Prix" {...form.register(`items.${index}.unitPrice`)} />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" disabled={fields.length === 1} onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
              {form.formState.errors.items && (
                <p className="text-xs text-destructive">{form.formState.errors.items.message ?? "Vérifiez les articles"}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-elevation-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea placeholder="Instructions particulières (optionnel)" rows={3} {...form.register("notes")} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20 border-border shadow-elevation-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Récapitulatif</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Articles</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">{formatCurrency(total)}</span>
              </div>
              <Button type="submit" className="mt-2 w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer la commande
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
