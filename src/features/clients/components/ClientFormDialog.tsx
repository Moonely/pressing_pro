import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientSchema, type ClientInput } from "../schemas/client.schema";
import { clientsService } from "../services/clients.service";
import type { Client } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client?: Client | null;
}

export function ClientFormDialog({ open, onOpenChange, client }: Props) {
  const qc = useQueryClient();
  const isEdit = Boolean(client);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    values: {
      firstName: client?.firstName ?? "",
      lastName: client?.lastName ?? "",
      phone: client?.phone ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (input: ClientInput) =>
      isEdit && client ? clientsService.update(client.id, input) : clientsService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success(isEdit ? "Client mis à jour" : "Client créé");
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Une erreur est survenue"),
    onSettled: () => setSubmitting(false),
  });

  const onSubmit = (values: ClientInput) => {
    setSubmitting(true);
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le client" : "Nouveau client"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Mettez à jour les informations du client." : "Renseignez les informations du nouveau client."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" type="tel" placeholder="+221 77 000 00 00" {...form.register("phone")} />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
