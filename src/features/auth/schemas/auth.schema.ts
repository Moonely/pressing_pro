import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email invalide" }).max(255),
  password: z.string().min(4, { message: "Mot de passe trop court" }).max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;
