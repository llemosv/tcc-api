import { z } from 'zod';

export const createTccGuidanceSchema = z.object({
  id_aluno_solicitante: z.string().uuid(),
  id_professor_orientador: z.string().uuid(),
  solicitacao_aceita: z.boolean(),
  tema: z.string().min(1),
  previsao_entrega: z.string().min(1),
});

export type CreateTccGuidanceDTO = z.infer<typeof createTccGuidanceSchema>;
