import { z } from "zod";

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(1, "El nombre es requerido"),
    jid: z.string().min(1, "El JID es requerido"),
  }),
});
