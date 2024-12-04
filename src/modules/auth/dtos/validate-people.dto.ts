import { z } from 'zod';

export const validatePeopleSchema = z.object({
  email: z.string(),
  cpf: z.string(),
});

export type ValidatePeopleDTO = z.infer<typeof validatePeopleSchema>;
