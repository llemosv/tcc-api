import { z } from 'zod';

export const createTopicSchema = z.object({
  id_atividade: z.string().uuid(),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
  data_criacao: z.string().min(1),
  previsao_entrega: z.string().min(1),
});

export type CreateTopicDTO = z.infer<typeof createTopicSchema>;
export type TopicDTO = { id?: string } & z.infer<typeof createTopicSchema>;
