import * as schema from 'src/shared/database/schema';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_ORM } from 'src/core/constrants/db.constants';
import { CreateTccGuidanceDTO } from './dtos/create-tcc-guidance.dto';
import { sql, and, eq, like, isNull, not } from 'drizzle-orm';
import { RespondGuidanceRequestDTO } from './dtos/respond-to-guidance-request.dto';
import { alias } from 'drizzle-orm/pg-core';
import { UpdateTccThemeDTO } from './dtos/update-tcc-theme.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TccGuidancesService {
  constructor(
    @Inject(DRIZZLE_ORM) private database: PostgresJsDatabase<typeof schema>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private readonly logger = new Logger(TccGuidancesService.name);

  async create(createSolicitationDto: CreateTccGuidanceDTO): Promise<void> {
    const {
      id_aluno_solicitante,
      id_professor_orientador,
      solicitacao_aceita,
      tema,
      previsao_entrega,
    } = createSolicitationDto;

    const [solicitation] = await this.database
      .insert(schema.tccGuidances)
      .values({
        id_aluno_solicitante,
        id_professor_orientador,
        solicitacao_aceita,
        tema,
        previsao_entrega,
      })
      .returning();

    const [user] = await this.database
      .select()
      .from(schema.people)
      .where(eq(schema.people.id, solicitation.id_aluno_solicitante));

    await this.notificationsService.create({
      recipientUserId: solicitation.id_professor_orientador,
      senderUserId: solicitation.id_aluno_solicitante,
      message: `Nova solicitação de orientação de ${user.nome}.`,
      type: 'revisaoAtv',
      referenceId: solicitation.id,
    });
  }

  async findGuidances(
    id: string,
    type: 'aluno' | 'orientador' | 'coordenador',
    name?: string,
    status?: 'refused' | 'pending' | 'accepted',
    teacher?: string,
    id_course?: string,
  ): Promise<any> {
    const alunoPeople = alias(schema.people, 'aluno');
    const orientadorPeople = alias(schema.people, 'orientador');
    const cursosUsuario = alias(schema.peopleCourses, 'cursosUsuario');

    const conditions = [];

    if (type === 'aluno') {
      conditions.push(eq(schema.tccGuidances.id_aluno_solicitante, id));
    } else if (type === 'orientador') {
      conditions.push(eq(schema.tccGuidances.id_professor_orientador, id));
    } else if (type === 'coordenador') {
      conditions.push(eq(cursosUsuario.people_id, orientadorPeople.id));
    }

    if (name) {
      conditions.push(
        type === 'aluno'
          ? like(orientadorPeople.nome, `%${name}%`)
          : like(alunoPeople.nome, `%${name}%`),
      );
    }

    if (status) {
      switch (status) {
        case 'accepted':
          conditions.push(eq(schema.tccGuidances.solicitacao_aceita, true));
          break;
        case 'refused':
          conditions.push(not(isNull(schema.tccGuidances.data_reprovacao)));
          break;
        case 'pending':
          conditions.push(
            and(
              eq(schema.tccGuidances.solicitacao_aceita, false),
              isNull(schema.tccGuidances.data_reprovacao),
            ),
          );
          break;
      }
    }

    if (teacher) {
      conditions.push(eq(schema.tccGuidances.id_professor_orientador, teacher));
    }
    const query = this.database
      .select({
        id_orientacao: schema.tccGuidances.id,
        aluno: alunoPeople.nome,
        orientador: orientadorPeople.nome,
        tema: schema.tccGuidances.tema,
        previsao_entrega: sql<string>`TO_CHAR(${schema.tccGuidances.previsao_entrega}, 'DD/MM/YYYY')`,
        solicitacao_aceita: schema.tccGuidances.solicitacao_aceita,
        data_aprovacao: sql<string>`TO_CHAR(${schema.tccGuidances.data_aprovacao}, 'DD/MM/YYYY')`,
        data_reprovacao: sql<string>`TO_CHAR(${schema.tccGuidances.data_reprovacao}, 'DD/MM/YYYY')`,
        data_finalizacao: sql<string>`TO_CHAR(${schema.tccGuidances.data_finalizacao}, 'DD/MM/YYYY')`,
        justificativa_reprovacao: schema.tccGuidances.justificativaReprovacao,
        total_atividades: sql<number>`COUNT(${schema.tasks.id})`,
      })
      .from(schema.tccGuidances)
      .innerJoin(
        alunoPeople,
        eq(alunoPeople.id, schema.tccGuidances.id_aluno_solicitante),
      )
      .innerJoin(
        orientadorPeople,
        eq(orientadorPeople.id, schema.tccGuidances.id_professor_orientador),
      )
      .leftJoin(schema.tasks, eq(schema.tasks.id_tcc, schema.tccGuidances.id));

    if (type === 'coordenador') {
      query.innerJoin(cursosUsuario, eq(cursosUsuario.course_id, id_course));
    }

    query
      .where(and(...conditions))
      .groupBy(
        schema.tccGuidances.id,
        alunoPeople.nome,
        orientadorPeople.nome,
        schema.tccGuidances.tema,
        schema.tccGuidances.previsao_entrega,
        schema.tccGuidances.solicitacao_aceita,
        schema.tccGuidances.data_aprovacao,
        schema.tccGuidances.data_reprovacao,
        schema.tccGuidances.justificativaReprovacao,
      )
      .orderBy(
        sql`CASE 
                   WHEN ${schema.tccGuidances.solicitacao_aceita} = true THEN 1 
                   WHEN ${schema.tccGuidances.solicitacao_aceita} IS NULL AND ${schema.tccGuidances.data_reprovacao} IS NULL THEN 2 
                   ELSE 3 
                 END`,
      );

    return await query;
  }

  async respondToGuidanceRequest(
    id: string,
    respondGuidanceRequest: RespondGuidanceRequestDTO,
  ): Promise<any> {
    const [work] = await this.database
      .select()
      .from(schema.tccGuidances)
      .where(eq(schema.tccGuidances.id, id));

    await this.notificationsService.create({
      recipientUserId: work.id_aluno_solicitante,
      senderUserId: work.id_professor_orientador,
      message: `Resposta na solicitação de orientação do trabalho: ${work.tema}.`,
      type: 'novaAtividade',
      referenceId: work.id,
    });

    if (respondGuidanceRequest.accept) {
      return await this.database.execute(sql`
          UPDATE orientacoes_tcc SET solicitacao_aceita = true, data_aprovacao = CURRENT_DATE WHERE id = ${id}
      `);
    } else {
      return await this.database.execute(sql`
        UPDATE orientacoes_tcc SET solicitacao_aceita = false, data_reprovacao = CURRENT_DATE, justificativa_reprovacao = ${respondGuidanceRequest.justification} WHERE id = ${id}
    `);
    }
  }

  async findPendingGuidances(id: string): Promise<any> {
    const alunoPeople = alias(schema.people, 'aluno');
    const orientadorPeople = alias(schema.people, 'orientador');

    const query = this.database
      .select({
        id_orientacao: schema.tccGuidances.id,
        aluno: alunoPeople.nome,
        orientador: orientadorPeople.nome,
        tema: schema.tccGuidances.tema,
        previsao_entrega: sql<string>`TO_CHAR(${schema.tccGuidances.previsao_entrega}, 'DD/MM/YYYY')`,
        solicitacao_aceita: schema.tccGuidances.solicitacao_aceita,
        data_aprovacao: sql<string>`TO_CHAR(${schema.tccGuidances.data_aprovacao}, 'DD/MM/YYYY')`,
        data_reprovacao: sql<string>`TO_CHAR(${schema.tccGuidances.data_reprovacao}, 'DD/MM/YYYY')`,
        justificativa_reprovacao: schema.tccGuidances.justificativaReprovacao,
        total_atividades: sql<number>`COUNT(${schema.tasks.id})`,
      })
      .from(schema.tccGuidances)
      .innerJoin(
        alunoPeople,
        eq(alunoPeople.id, schema.tccGuidances.id_aluno_solicitante),
      )
      .innerJoin(
        orientadorPeople,
        eq(orientadorPeople.id, schema.tccGuidances.id_professor_orientador),
      )
      .leftJoin(schema.tasks, eq(schema.tasks.id_tcc, schema.tccGuidances.id))
      .where(
        and(
          eq(schema.tccGuidances.solicitacao_aceita, false),
          isNull(schema.tccGuidances.data_reprovacao),
          eq(schema.tccGuidances.id_professor_orientador, id),
        ),
      )
      .groupBy(
        schema.tccGuidances.id,
        alunoPeople.nome,
        orientadorPeople.nome,
        schema.tccGuidances.tema,
        schema.tccGuidances.previsao_entrega,
        schema.tccGuidances.solicitacao_aceita,
        schema.tccGuidances.data_aprovacao,
        schema.tccGuidances.data_reprovacao,
        schema.tccGuidances.justificativaReprovacao,
      );

    return await query;
  }

  async updateTccTheme(
    id: string,
    updateTccThemeDTO: UpdateTccThemeDTO,
  ): Promise<void> {
    const [work] = await this.database
      .select()
      .from(schema.tccGuidances)
      .where(eq(schema.tccGuidances.id, id));

    await this.notificationsService.create({
      recipientUserId: work.id_aluno_solicitante,
      senderUserId: work.id_professor_orientador,
      message: `Tema do trabalho: ${work.tema} alterado para: ${updateTccThemeDTO.theme}.`,
      type: 'novaAtividade',
      referenceId: work.id,
    });

    await this.database.execute(sql`
          UPDATE orientacoes_tcc SET tema = ${updateTccThemeDTO.theme} WHERE id = ${id}
      `);
  }

  async getTeacherGuidancesCount(id_course: string): Promise<
    {
      professor: string;
      numero_trabalhos: number;
    }[]
  > {
    const data = await this.database.execute<{
      professor: string;
      numero_trabalhos: number;
    }>(sql`
      SELECT usuario.nome AS professor,
            count(*) AS numero_trabalhos
      FROM orientacoes_tcc
      INNER JOIN usuario ON usuario.id = orientacoes_tcc.id_professor_orientador
      INNER JOIN cursos_usuario ON cursos_usuario.course_id = ${id_course}
      AND cursos_usuario.people_id = orientacoes_tcc.id_professor_orientador
      GROUP BY usuario.nome
      `);

    return data;
  }

  async getGuidancesCount(id_course: string): Promise<
    {
      count: number;
    }[]
  > {
    const data = await this.database.execute<{
      count: number;
    }>(sql`
      SELECT count(DISTINCT orientacoes_tcc.tema)
      FROM orientacoes_tcc
      INNER JOIN usuario ON usuario.id = orientacoes_tcc.id_professor_orientador
      INNER JOIN cursos_usuario ON cursos_usuario.course_id = ${id_course}
      AND cursos_usuario.people_id = orientacoes_tcc.id_professor_orientador
      `);

    return data;
  }

  async concludeGuidance(id_tcc: string): Promise<void> {
    await this.database.execute(sql`
        UPDATE orientacoes_tcc SET data_finalizacao = CURRENT_DATE WHERE id = ${id_tcc}
        `);
  }
}
