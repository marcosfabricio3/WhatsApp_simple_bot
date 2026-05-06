import { z } from "zod";

export const templateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "El nombre es requerido"),
    content: z.string().min(1, "El contenido es requerido"),
  }),
});
