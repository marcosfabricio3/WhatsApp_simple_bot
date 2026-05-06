import { z } from "zod";

export const automationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "El nombre es requerido"),
    messageContent: z.string().min(1, "El contenido del mensaje es requerido"),
    recipients: z.array(z.string()).min(1, "Debe haber al menos un destinatario"),
    scheduleType: z.enum(["one_time", "recurring"]),
    scheduleValue: z.string().min(1, "El valor de programación es requerido"),
  }),
});

export const updateAutomationStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "paused", "completed", "failed"]),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID debe ser un número"),
  }),
});
