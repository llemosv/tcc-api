import { z } from 'zod';

export const createPeopleSchema = z.object({
  nome: z.string(),
  email: z.string(),
  senha: z.string(),
  fl_ativo: z.boolean(),
  id_tipo_pessoa: z.string().uuid(),
  id_courses: z.array(z.string().uuid()),
});

export type CreatePeopleDTO = z.infer<typeof createPeopleSchema>;
export type PeopleDTO = { id: string } & z.infer<typeof createPeopleSchema>;
