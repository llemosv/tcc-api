import * as schema from 'src/shared/database/schema';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_ORM } from 'src/core/constrants/db.constants';
import { CreateTccGuidanceDTO } from './dtos/create-tcc-guidance.dto';
import { sql, and, eq, like, isNull, not } from 'drizzle-orm';
import { RespondGuidanceRequestDTO } from './dtos/respond-to-guidance-request.dto';
import { alias } from 'drizzle-orm/pg-core';

@Injectable()
export class TccGuidancesService {
  constructor(
    @Inject(DRIZZLE_ORM) private database: PostgresJsDatabase<typeof schema>,
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

    await this.database.insert(schema.tccGuidances).values({
      id_aluno_solicitante,
      id_professor_orientador,
      solicitacao_aceita,
      tema,
      previsao_entrega,
    });
  }

  async findGuidances(
    id: string,
    type: 'aluno' | 'orientador',
    name?: string,
    status?: 'refused' | 'pending' | 'accepted',
  ): Promise<any> {
    const alunoPeople = alias(schema.people, 'aluno');
    const orientadorPeople = alias(schema.people, 'orientador');

    const conditions = [
      type === 'aluno'
        ? eq(schema.tccGuidances.id_aluno_solicitante, id)
        : eq(schema.tccGuidances.id_professor_orientador, id),
    ];

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
              isNull(schema.tccGuidances.solicitacao_aceita),
              isNull(schema.tccGuidances.data_reprovacao),
            ),
          );
          break;
      }
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
    id: number,
    respondGuidanceRequest: RespondGuidanceRequestDTO,
  ): Promise<any> {
    if (respondGuidanceRequest.accept) {
      return await this.database.execute(sql`
          UPDATE tcc_guidances SET solicitacao_aceita = true, data_aprovacao = CURRENT_DATE WHERE id = ${id}
      `);
    } else {
      return await this.database.execute(sql`
        UPDATE tcc_guidances SET solicitacao_aceita = false, data_reprovacao = CURRENT_DATE, justificativa_reprovacao = ${respondGuidanceRequest.justification} WHERE id = ${id}
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
      .leftJoin(
        // Adicionando o JOIN com a tabela tasks
        schema.tasks,
        eq(schema.tasks.id_tcc, schema.tccGuidances.id), // Ajuste conforme sua lógica de relacionamento
      )
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
}
