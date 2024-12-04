import * as schema from 'src/shared/database/schema';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_ORM } from 'src/core/constrants/db.constants';
import { eq, sql } from 'drizzle-orm';
import { CreateTopicDTO, TopicDTO } from './dtos/create-topic.dto';
import { CreateTopicMessageDTO } from './dtos/create-topic-message.dto';
import { TopicMessageDTO } from './dtos/topic-message.dto';
import { join } from 'path';
import { S3Service } from 'src/shared/s3Provider/s3.service';

@Injectable()
export class TopicsService {
  constructor(
    @Inject(DRIZZLE_ORM) private database: PostgresJsDatabase<typeof schema>,
    private s3Service: S3Service,
  ) {}

  private readonly logger = new Logger(TopicsService.name);

  async create(createTopicDTO: CreateTopicDTO): Promise<void> {
    const { id_atividade, titulo, descricao, data_criacao, previsao_entrega } =
      createTopicDTO;

    await this.database.insert(schema.taskTopics).values({
      id_atividade,
      titulo,
      descricao,
      data_criacao,
      previsao_entrega,
    });
  }

  async getTopics(id_task: string): Promise<TopicDTO[]> {
    const response = await this.database.execute<TopicDTO>(sql`
      select id,
             id_atividade,
             titulo,
             descricao,
             TO_CHAR(topicos_atividades.data_criacao, 'DD/MM/YYYY') as data_criacao, 
             TO_CHAR(topicos_atividades.previsao_entrega, 'DD/MM/YYYY') as previsao_entrega,
             TO_CHAR(topicos_atividades.data_finalizacao, 'DD/MM/YYYY') as data_finalizacao,
             TO_CHAR(topicos_atividades.data_pendente_revisao, 'DD/MM/YYYY') as data_pendente_revisao,
             justificativa
      from topicos_atividades
      where id_atividade = ${id_task}
      `);

    return response;
  }

  async createMessage(createTopicMessageDTO: any): Promise<{
    id: string;
    data_criacao: string;
    id_topico: string;
    id_autor: string;
    conteudo: string;
  }> {
    const { id_topico, id_autor, conteudo } = createTopicMessageDTO;
    console.log(id_topico, id_autor, conteudo);
    const [response] = await this.database
      .insert(schema.topicMessages)
      .values({ id_topico: id_topico, id_autor, conteudo })
      .returning();

    return response;
  }

  async getMessageById(id_message: string): Promise<TopicMessageDTO> {
    const [response] = await this.database
      .select({
        id_mensagem: schema.topicMessages.id,
        id_topic: schema.topicMessages.id_topico,
        id_autor: schema.people.id,
        conteudo: schema.topicMessages.conteudo,
        data_criacao: sql<string>`TO_CHAR(${schema.topicMessages.data_criacao}AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')`,
        autor: schema.people.nome,
      })
      .from(schema.topicMessages)
      .innerJoin(
        schema.taskTopics,
        eq(schema.taskTopics.id, schema.topicMessages.id_topico),
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
      select mensagens_topico.id as id_mensagem,
            mensagens_topico.id_topico,
            usuario.id as id_autor,
            mensagens_topico.conteudo,
            TO_CHAR(mensagens_topico.data_criacao AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS data_criacao,            
            usuario.nome as autor
      from mensagens_topico
      join topicos_atividades on topicos_atividades.id = mensagens_topico.id_topico
      join usuario on usuario.id = mensagens_topico.id_autor
      where mensagens_topico.id_topico = ${id_topic}
      order by mensagens_topico.data_criacao
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
      UPDATE topicos_atividades SET data_pendente_revisao = CURRENT_DATE WHERE id = ${id}
  `);
  }

  async concludeTask(
    id: string,
    conclude: boolean,
    justification?: string,
  ): Promise<void> {
    await this.database.execute(sql`
      UPDATE topicos_atividades 
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

  async uploadFile(
    idTopic: string,
    fileName: string,
    fileType: string,
  ): Promise<void> {
    const fileFolder = join(__dirname, '../../../../tmp');
    console.log(idTopic, fileName, `${fileFolder}/${fileName}`);

    await this.s3Service.uploadFile(`${fileFolder}/${fileName}`, fileType);

    await this.database.insert(schema.topicFiles).values({
      id_topico: idTopic,
      nome_arquivo: fileName,
      caminho: process.env.BUCKET_FILE_URL + '/' + fileName,
    });
  }

  async getFilesTopic(idTopic: string): Promise<
    {
      id: string;
      id_topico: string;
      nome_arquivo: string;
      caminho: string;
      data_upload: string;
    }[]
  > {
    const result = await this.database
      .select()
      .from(schema.topicFiles)
      .where(eq(schema.topicFiles.id_topico, idTopic));

    return result;
  }
}
