import { z } from "zod";

export const triggerSchema = z.object({
  body: z.object({
    keyword: z.string().min(1, "La palabra clave es requerida"),
    matchMode: z.enum(["exact", "contains", "regex"]),
    responseMessage: z.string().min(1, "El mensaje de respuesta es requerido"),
    chatIds: z.array(z.string()).optional(),
  }),
});

export const updateTriggerStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "inactive"]),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID debe ser un número"),
  }),
});
