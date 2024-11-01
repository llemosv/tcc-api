import * as schema from 'src/shared/database/schema';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_ORM } from 'src/core/constrants/db.constants';
import { eq, sql } from 'drizzle-orm';
import { CreateTopicDTO, TopicDTO } from './dtos/create-topic.dto';
import { CreateTopicMessageDTO } from './dtos/create-topic-message.dto';
import { TopicMessageDTO } from './dtos/topic-message.dto';

@Injectable()
export class TopicsService {
  constructor(
    @Inject(DRIZZLE_ORM) private database: PostgresJsDatabase<typeof schema>,
  ) {}

  private readonly logger = new Logger(TopicsService.name);

  async create(createTopicDTO: CreateTopicDTO): Promise<void> {
    const { id_task, titulo, descricao, data_criacao, previsao_entrega } =
      createTopicDTO;

    await this.database
      .insert(schema.taskTopics)
      .values({ id_task, titulo, descricao, data_criacao, previsao_entrega });
  }

  async getTopics(id_task: string): Promise<TopicDTO[]> {
    const response = await this.database.execute<TopicDTO>(sql`
      select id,
             id_task,
             titulo,
             descricao,
             TO_CHAR(task_topics.data_criacao, 'DD/MM/YYYY') as data_criacao, 
             TO_CHAR(task_topics.previsao_entrega, 'DD/MM/YYYY') as previsao_entrega,
             TO_CHAR(task_topics.data_finalizacao, 'DD/MM/YYYY') as data_finalizacao,
             TO_CHAR(task_topics.data_pendente_revisao, 'DD/MM/YYYY') as data_pendente_revisao,
             justificativa
      from task_topics
      where id_task = ${id_task}
      `);

    return response;
  }

  async createMessage(createTopicMessageDTO: CreateTopicMessageDTO): Promise<{
    id: string;
    data_criacao: string;
    id_topic: string;
    id_autor: string;
    conteudo: string;
  }> {
    const { id_topic, id_autor, conteudo } = createTopicMessageDTO;

    const [response] = await this.database
      .insert(schema.topicMessages)
      .values({ id_topic, id_autor, conteudo })
      .returning();

    return response;
  }

  async getMessageById(id_message: string): Promise<TopicMessageDTO> {
    const [response] = await this.database
      .select({
        id_mensagem: schema.topicMessages.id,
        id_topic: schema.topicMessages.id_topic,
        id_autor: schema.people.id,
        conteudo: schema.topicMessages.conteudo,
        data_criacao: sql<string>`TO_CHAR(${schema.topicMessages.data_criacao}AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')`,
        autor: schema.people.nome,
      })
      .from(schema.topicMessages)
      .innerJoin(
        schema.taskTopics,
        eq(schema.taskTopics.id, schema.topicMessages.id_topic),
      )
      .innerJoin(
        schema.people,
        eq(schema.people.id, schema.topicMessages.id_autor),
      )
      .where(eq(schema.topicMessages.id, id_message));

    return response;
  }
  async getMessages(id_topic: string): Promise<TopicMessageDTO[]> {
    const response = await this.database.execute<TopicMessageDTO>(sql`
      select topic_messages.id as id_mensagem,
            topic_messages.id_topic,
            people.id as id_autor,
            topic_messages.conteudo,
            TO_CHAR(topic_messages.data_criacao AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS data_criacao,            
            people.nome as autor
      from topic_messages
      join task_topics on task_topics.id = topic_messages.id_topic
      join people on people.id = topic_messages.id_autor
      where topic_messages.id_topic = ${id_topic}
      order by topic_messages.data_criacao
      `);

    return response;
  }

  async delete(id: string): Promise<void> {
    await this.database
      .delete(schema.taskTopics)
      .where(eq(schema.taskTopics.id, id));
  }

  async pendingReview(id: string): Promise<void> {
    await this.database.execute(sql`
      UPDATE task_topics SET data_pendente_revisao = CURRENT_DATE WHERE id = ${id}
  `);
  }

  async concludeTask(
    id: string,
    conclude: boolean,
    justification?: string,
  ): Promise<void> {
    await this.database.execute(sql`
      UPDATE task_topics 
      SET 
          ${
            conclude
              ? sql`data_finalizacao = CURRENT_DATE,`
              : sql`data_pendente_revisao = NULL,`
          }
          justificativa = ${justification}
      WHERE id = ${id}
  `);
  }
}
