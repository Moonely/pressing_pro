import { z } from "zod";

export const clientSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(60),
  lastName: z.string().trim().min(1, "Nom requis").max(60),
  phone: z.string().trim().min(6, "Téléphone invalide").max(30),
});

export type ClientInput = z.infer<typeof clientSchema>;
