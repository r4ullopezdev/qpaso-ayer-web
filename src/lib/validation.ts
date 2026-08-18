import { z } from "zod";

export const listType = z.enum(["CHICAS", "CHICOS"]);

export const signupSchema = z.object({
  eventId: z.string().min(1),
  list: listType,
  name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Correo inválido").max(120).optional().or(z.literal("")),
  guests: z.coerce.number().int().min(1).max(20).default(1),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const eventSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  motor: z.string().trim().max(40).optional().or(z.literal("")),
  date: z.string().min(1), // datetime-local
  startTime: z.string().trim().max(10).default("22:00"),
  published: z.coerce.boolean().default(false),
  closed: z.coerce.boolean().default(false),
  girlsListOpen: z.coerce.boolean().default(true),
  guysListOpen: z.coerce.boolean().default(true),
  girlsFreeUntil: z.string().trim().max(10).default("00:00"),
  guysFreeUntil: z.string().trim().max(10).default("23:00"),
  girlsCap: z.coerce.number().int().min(0).optional().nullable(),
  guysCap: z.coerce.number().int().min(0).optional().nullable(),
});

export type EventInput = z.infer<typeof eventSchema>;
