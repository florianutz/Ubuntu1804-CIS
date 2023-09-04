import { z } from "zod";

export const ProviderSchema = z
  .object({
    id: z.string().optional(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string(),
    states: z.string().array(),
    active: z.boolean(),
  })
  .strict();

export type Provider = z.infer<typeof ProviderSchema>;
