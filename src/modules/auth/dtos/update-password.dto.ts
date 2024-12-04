import { z } from 'zod';

export const updatePasswordSchema = z.object({
  password: z.string(),
  cpf: z.string(),
  email: z.string(),
});

export type UpdatePasswordDTO = z.infer<typeof updatePasswordSchema>;
