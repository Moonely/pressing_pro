import { z } from "zod";

export const orderItemSchema = z.object({
  label: z.string().trim().min(1, "Libellé requis").max(80),
  quantity: z.coerce.number().int().min(1, "Min 1").max(999),
  unitPrice: z.coerce.number().min(0).max(10_000_000),
});

export const orderSchema = z.object({
  clientId: z.string().min(1, "Sélectionnez un client"),
  items: z.array(orderItemSchema).min(1, "Au moins un article"),
  notes: z.string().max(500).optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
