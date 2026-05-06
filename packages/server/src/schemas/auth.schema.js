import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Debe ser un email válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Debe ser un email válido"),
    password: z.string().min(1, "La contraseña es requerida"),
  }),
});
