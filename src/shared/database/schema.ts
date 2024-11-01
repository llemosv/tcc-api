import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  pgTable,
  text,
  varchar,
  uuid,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

export const peopleTypes = pgTable('people_types', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tipo: varchar('tipo', { length: 50 }).notNull(),
});

export const people = pgTable('people', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  nome: text('nome'),
  email: varchar('email', { length: 255 }).unique(),
  senha: text('senha'),
  fl_ativo: boolean('fl_ativo'),
  id_tipo_pessoa: uuid('id_tipo_pessoa')
    .notNull()
    .references(() => peopleTypes.id),
});

export const courses = pgTable('courses', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  semesters: integer('semesters').notNull(),
});

export const peopleCourses = pgTable('people_courses', {
  people_id: uuid('people_id')
    .notNull()
    .references(() => people.id),
  course_id: uuid('course_id')
    .notNull()
    .references(() => courses.id),
});

export const tccGuidances = pgTable('tcc_guidances', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  id_aluno_solicitante: uuid('id_aluno_solicitante')
    .notNull()
    .references(() => people.id),
  id_professor_orientador: uuid('id_professor_orientador')
    .notNull()
    .references(() => people.id),
  solicitacao_aceita: boolean('solicitacao_aceita').notNull(),
  tema: varchar('tema', { length: 255 }).notNull(),
  previsao_entrega: date('previsao_entrega').notNull(),
  justificativaReprovacao: text('justificativa_reprovacao'),
  data_aprovacao: date('data_aprovacao'),
  data_reprovacao: date('data_reprovacao'),
});

export const tasks = pgTable('tasks', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  id_tcc: uuid('id_tcc')
    .notNull()
    .references(() => tccGuidances.id),
  tarefa: varchar('tarefa', { length: 255 }).notNull(),
  data_criacao: date('data_criacao').notNull(),
  previsao_entrega: date('previsao_entrega').notNull(),
  data_pendente_revisao: date('data_pendente_revisao'),
  justificativa: text('justificativa'),
  data_finalizacao: date('data_finalizacao'),
});

export const taskTopics = pgTable('task_topics', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  id_task: uuid('id_task')
    .notNull()
    .references(() => tasks.id),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  descricao: text('descricao').notNull(),
  data_criacao: date('data_criacao').notNull(),
  previsao_entrega: date('previsao_entrega').notNull(),
  data_pendente_revisao: date('data_pendente_revisao'),
  justificativa: text('justificativa'),
  data_finalizacao: date('data_finalizacao'),
});

export const topicMessages = pgTable('topic_messages', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  id_topic: uuid('id_topic')
    .notNull()
    .references(() => taskTopics.id),
  id_autor: uuid('id_autor')
    .notNull()
    .references(() => people.id),
  conteudo: text('conteudo').notNull(),
  data_criacao: timestamp('data_criacao', { mode: 'string' })
    .notNull()
    .defaultNow(),
});

export const topicFiles = pgTable('topic_files', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  id_topic_messages: uuid('id_topic_messages')
    .notNull()
    .references(() => topicMessages.id),
  nome_arquivo: varchar('nome_arquivo', { length: 255 }).notNull(),
  caminho: text('caminho').notNull(),
  data_upload: timestamp('data_upload', { mode: 'string' })
    .notNull()
    .defaultNow(),
});

export const notificationType = pgTable('notification_type', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tipo: varchar('tipo', { length: 100 }).notNull(),
});

export const notification = pgTable('notification', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  id_tipo_notificacao: uuid('id_tipo_notificacao')
    .notNull()
    .references(() => notificationType.id),
  id_usuario_remetente: uuid('id_usuario_remetente')
    .notNull()
    .references(() => people.id),
  id_usuario_destinatario: uuid('id_usuario_destinatario')
    .notNull()
    .references(() => people.id),
  mensagem: varchar('mensagem', { length: 254 }).notNull(),
  lida: boolean('lida').notNull().default(false),
  id_referencia: uuid('id_referencia').notNull(),
});
