import { z } from 'zod';

export const createTopicMessageSchema = z.object({
  id_topico: z.string().uuid(),
  id_autor: z.string().uuid(),
  conteudo: z.string().min(1),
});

export type CreateTopicMessageDTO = z.infer<typeof createTopicMessageSchema>;
export type CreateTopicMessageResponse = {
  id: string;
  data_criacao: string;
} & z.infer<typeof createTopicMessageSchema>;
