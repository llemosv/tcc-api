import { z } from 'zod';

export const createTaskSchema = z.object({
  id_tcc: z.string().uuid(),
  tarefa: z.string().min(1),
  data_criacao: z.string().min(1),
  previsao_entrega: z.string().min(1),
});

export type TaskDTO = z.infer<typeof createTaskSchema>;
