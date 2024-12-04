import * as schema from 'src/shared/database/schema';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_ORM } from 'src/core/constrants/db.constants';
import { TaskDTO } from './dtos/create-task.dto';
import {
  and,
  eq,
  gte,
  isNotNull,
  isNull,
  like,
  lt,
  SQL,
  sql,
} from 'drizzle-orm';
import { TasksCount } from './dtos/tasks.count.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { TasksPendingApproval } from './dtos/tasks-pending-approval.dto';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DRIZZLE_ORM) private database: PostgresJsDatabase<typeof schema>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private readonly logger = new Logger(TasksService.name);

  async create(createTaskDto: TaskDTO): Promise<void> {
    const { id_tcc, tarefa, data_criacao, previsao_entrega } = createTaskDto;

    try {
      await this.database
        .insert(schema.tasks)
        .values({ id_tcc, tarefa, data_criacao, previsao_entrega });

      const [work] = await this.database
        .select()
        .from(schema.tccGuidances)
        .where(eq(schema.tccGuidances.id, id_tcc));

      if (!work) {
        throw new NotFoundException(
          `Orientação com ID ${id_tcc} não encontrada.`,
        );
      }

      await this.notificationsService.create({
        recipientUserId: work.id_aluno_solicitante,
        senderUserId: work.id_professor_orientador,
        message: `Nova atividade criada no trabalho ${work.tema}.`,
        type: 'novaAtividade',
        referenceId: work.id,
      });
    } catch (error) {
      throw new BadRequestException(`Falha ao criar tarefa: ${error.message}`);
    }
  }

  async pendingReview(id: string): Promise<void> {
    const validateTopics = await this.database
      .select()
      .from(schema.taskTopics)
      .where(
        and(
          eq(schema.taskTopics.id_atividade, id),
          isNull(schema.taskTopics.data_finalizacao),
        ),
      );

    if (validateTopics.length > 0)
      throw new BadRequestException(
        'Para solicitar uma revisão da atividade é necessário que todos os tópicos estejam concluídos.',
      );

    await this.database.execute(sql`
      UPDATE atividades SET data_pendente_revisao = CURRENT_DATE WHERE id = ${id}
  `);

    const [work] = await this.database
      .select({
        id: schema.tccGuidances.id,
        id_aluno_solicitante: schema.tccGuidances.id_aluno_solicitante,
        id_professor_orientador: schema.tccGuidances.id_professor_orientador,
        tema: schema.tccGuidances.tema,
      })
      .from(schema.tccGuidances)
      .innerJoin(schema.tasks, eq(schema.tasks.id_tcc, schema.tccGuidances.id))
      .where(eq(schema.tasks.id, id));

    await this.notificationsService.create({
      recipientUserId: work.id_professor_orientador,
      senderUserId: work.id_aluno_solicitante,
      message: `Nova solicitação para revisar atividade no TCC ${work.tema}.`,
      type: 'revisaoAtv',
      referenceId: work.id,
    });
  }

  async concludeTask(
    id: string,
    conclude: boolean,
    justification?: string,
  ): Promise<void> {
    await this.database.execute(sql`
      UPDATE atividades 
      SET 
          ${
            conclude
              ? sql`data_finalizacao = CURRENT_DATE,`
              : sql`data_pendente_revisao = NULL,`
          }
          justificativa = ${justification}
      WHERE id = ${id}
  `);

    const [work] = await this.database
      .select({
        id: schema.tccGuidances.id,
        id_aluno_solicitante: schema.tccGuidances.id_aluno_solicitante,
        id_professor_orientador: schema.tccGuidances.id_professor_orientador,
        tema: schema.tccGuidances.tema,
      })
      .from(schema.tccGuidances)
      .innerJoin(schema.tasks, eq(schema.tasks.id_tcc, schema.tccGuidances.id))
      .where(eq(schema.tasks.id, id));

    await this.notificationsService.create({
      recipientUserId: work.id_aluno_solicitante,
      senderUserId: work.id_professor_orientador,
      message: `Atividade revisada no TCC ${work.tema}.`,
      type: 'revisaoAtv',
      referenceId: work.id,
    });
  }

  async getTasks(
    id_tcc: string,
    taskName?: string,
    status?: 'concluded' | 'delayed' | 'pending',
  ): Promise<
    {
      id: string;
      id_tcc: string;
      tarefa: string;
      data_criacao: unknown;
      previsao_entrega: unknown;
      data_pendente_revisao: unknown;
      data_finalizacao: unknown;
    }[]
  > {
    const conditions: SQL[] = [];

    if (taskName) {
      conditions.push(like(schema.tasks.tarefa, `%${taskName}%`));
    }

    if (status) {
      switch (status) {
        case 'concluded':
          conditions.push(isNotNull(schema.tasks.data_finalizacao));
          break;
        case 'delayed':
          conditions.push(
            isNull(schema.tasks.data_finalizacao),
            lt(schema.tasks.previsao_entrega, sql`NOW()`),
          );
          break;
        case 'pending':
          conditions.push(
            isNull(schema.tasks.data_finalizacao),
            gte(schema.tasks.previsao_entrega, sql`NOW()`),
          );
          break;
      }
    }

    const query = await this.database
      .select({
        id: schema.tasks.id,
        id_tcc: schema.tasks.id_tcc,
        tarefa: schema.tasks.tarefa,
        data_criacao: sql`TO_CHAR(${schema.tasks.data_criacao}, 'DD/MM/YYYY')`,
        previsao_entrega: sql`TO_CHAR(${schema.tasks.previsao_entrega}, 'DD/MM/YYYY')`,
        data_pendente_revisao: sql`TO_CHAR(${schema.tasks.data_pendente_revisao}, 'DD/MM/YYYY')`,
        data_finalizacao: sql`TO_CHAR(${schema.tasks.data_finalizacao}, 'DD/MM/YYYY')`,
        justificativa: schema.tasks.justificativa,
      })
      .from(schema.tasks)
      .where(and(eq(schema.tasks.id_tcc, id_tcc), ...conditions));

    return query;
  }

  async getPendingTasks(id_tcc: number): Promise<TaskDTO[]> {
    const response = (await this.database.execute(sql`
      SELECT atividades.id, 
            atividades.tarefa, 
            TO_CHAR(atividades.data_criacao, 'DD/MM/YYYY') AS data_criacao, 
            TO_CHAR(atividades.previsao_entrega, 'DD/MM/YYYY') AS previsao_entrega,
            TO_CHAR(atividades.data_finalizacao, 'DD/MM/YYYY') AS data_finalizacao
      FROM   atividades 
      WHERE  id_tcc = ${id_tcc}
            AND data_finalizacao IS NULL
      ORDER BY atividades.previsao_entrega;

      `)) as TaskDTO[];

    return response;
  }

  async getTasksCount(id_tcc: number): Promise<TasksCount[]> {
    const tasks = await this.database.execute(sql`
      select atividades.id, atividades.previsao_entrega, atividades.data_criacao, atividades.data_finalizacao 
      from atividades 
      where id_tcc = ${id_tcc}
      `);
    const today = new Date();

    let overdue = 0;
    let pending = 0;
    let concluded = 0;

    tasks.map((task: any) => {
      const previsaoEntrega = new Date(task.previsao_entrega);

      if (task.data_finalizacao) {
        concluded += 1;
      } else if (today > previsaoEntrega) {
        overdue += 1;
      } else {
        pending += 1;
      }
    });

    const data = [
      { status: 'overdue', deliveries: overdue, fill: 'var(--color-overdue)' },
      { status: 'pending', deliveries: pending, fill: 'var(--color-pending)' },
      {
        status: 'concluded',
        deliveries: concluded,
        fill: 'var(--color-concluded)',
      },
    ];

    return data;
  }

  async getTasksPendingApproval(
    id_professor_orientador: string,
  ): Promise<TasksPendingApproval[]> {
    const tasks = await this.database
      .select({
        id: schema.tasks.id,
        id_tcc: schema.tasks.id_tcc,
        tarefa: schema.tasks.tarefa,
        data_criacao: sql`TO_CHAR(${schema.tasks.data_criacao}, 'DD/MM/YYYY')`,
        solicitacao_revisao: sql`TO_CHAR(${schema.tasks.data_pendente_revisao}, 'DD/MM/YYYY')`,
        previsao_entrega: sql`TO_CHAR(${schema.tasks.previsao_entrega}, 'DD/MM/YYYY')`,
      })
      .from(schema.tasks)
      .innerJoin(
        schema.tccGuidances,
        eq(schema.tccGuidances.id, schema.tasks.id_tcc),
      )
      .where(
        and(
          eq(
            schema.tccGuidances.id_professor_orientador,
            id_professor_orientador,
          ),
          isNull(schema.tasks.data_finalizacao),
          isNotNull(schema.tasks.data_pendente_revisao),
        ),
      );

    return tasks as TasksPendingApproval[];
  }
}
