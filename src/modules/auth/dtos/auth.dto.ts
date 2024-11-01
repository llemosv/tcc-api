import { z } from 'zod';

export const authSchema = z.object({
  email: z.string(),
  senha: z.string().min(4),
});

export type AuthDTO = z.infer<typeof authSchema>;
