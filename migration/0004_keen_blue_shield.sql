ALTER TABLE "courses" RENAME TO "cursos";--> statement-breakpoint
ALTER TABLE "notification" RENAME TO "notificacao";--> statement-breakpoint
ALTER TABLE "notification_type" RENAME TO "tipo_notificacao";--> statement-breakpoint
ALTER TABLE "people" RENAME TO "usuario";--> statement-breakpoint
ALTER TABLE "people_courses" RENAME TO "cursos_usuario";--> statement-breakpoint
ALTER TABLE "people_types" RENAME TO "tipos_usuario";--> statement-breakpoint
ALTER TABLE "task_topics" RENAME TO "topicos_atividades";--> statement-breakpoint
ALTER TABLE "tasks" RENAME TO "atividades";--> statement-breakpoint
ALTER TABLE "tcc_guidances" RENAME TO "orientacoes_tcc";--> statement-breakpoint
ALTER TABLE "topic_files" RENAME TO "arquivos_topico";--> statement-breakpoint
ALTER TABLE "topic_messages" RENAME TO "mensagens_topico";--> statement-breakpoint
ALTER TABLE "topicos_atividades" RENAME COLUMN "id_task" TO "id_atividade";--> statement-breakpoint
ALTER TABLE "arquivos_topico" RENAME COLUMN "id_topic_messages" TO "id_mensagem_topico";--> statement-breakpoint
ALTER TABLE "mensagens_topico" RENAME COLUMN "id_topic" TO "id_topico";--> statement-breakpoint
ALTER TABLE "usuario" DROP CONSTRAINT "people_email_unique";--> statement-breakpoint
ALTER TABLE "usuario" DROP CONSTRAINT "people_cpf_unique";--> statement-breakpoint
ALTER TABLE "notificacao" DROP CONSTRAINT "notification_id_tipo_notificacao_notification_type_id_fk";
--> statement-breakpoint
ALTER TABLE "notificacao" DROP CONSTRAINT "notification_id_usuario_remetente_people_id_fk";
--> statement-breakpoint
ALTER TABLE "notificacao" DROP CONSTRAINT "notification_id_usuario_destinatario_people_id_fk";
--> statement-breakpoint
ALTER TABLE "usuario" DROP CONSTRAINT "people_id_tipo_pessoa_people_types_id_fk";
--> statement-breakpoint
ALTER TABLE "cursos_usuario" DROP CONSTRAINT "people_courses_people_id_people_id_fk";
--> statement-breakpoint
ALTER TABLE "cursos_usuario" DROP CONSTRAINT "people_courses_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "topicos_atividades" DROP CONSTRAINT "task_topics_id_task_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "atividades" DROP CONSTRAINT "tasks_id_tcc_tcc_guidances_id_fk";
--> statement-breakpoint
ALTER TABLE "orientacoes_tcc" DROP CONSTRAINT "tcc_guidances_id_aluno_solicitante_people_id_fk";
--> statement-breakpoint
ALTER TABLE "orientacoes_tcc" DROP CONSTRAINT "tcc_guidances_id_professor_orientador_people_id_fk";
--> statement-breakpoint
ALTER TABLE "arquivos_topico" DROP CONSTRAINT "topic_files_id_topic_messages_topic_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "mensagens_topico" DROP CONSTRAINT "topic_messages_id_topic_task_topics_id_fk";
--> statement-breakpoint
ALTER TABLE "mensagens_topico" DROP CONSTRAINT "topic_messages_id_autor_people_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_id_tipo_notificacao_tipo_notificacao_id_fk" FOREIGN KEY ("id_tipo_notificacao") REFERENCES "public"."tipo_notificacao"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_id_usuario_remetente_usuario_id_fk" FOREIGN KEY ("id_usuario_remetente") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_id_usuario_destinatario_usuario_id_fk" FOREIGN KEY ("id_usuario_destinatario") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_tipo_pessoa_tipos_usuario_id_fk" FOREIGN KEY ("id_tipo_pessoa") REFERENCES "public"."tipos_usuario"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cursos_usuario" ADD CONSTRAINT "cursos_usuario_people_id_usuario_id_fk" FOREIGN KEY ("people_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cursos_usuario" ADD CONSTRAINT "cursos_usuario_course_id_cursos_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."cursos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topicos_atividades" ADD CONSTRAINT "topicos_atividades_id_atividade_atividades_id_fk" FOREIGN KEY ("id_atividade") REFERENCES "public"."atividades"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "atividades" ADD CONSTRAINT "atividades_id_tcc_orientacoes_tcc_id_fk" FOREIGN KEY ("id_tcc") REFERENCES "public"."orientacoes_tcc"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orientacoes_tcc" ADD CONSTRAINT "orientacoes_tcc_id_aluno_solicitante_usuario_id_fk" FOREIGN KEY ("id_aluno_solicitante") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orientacoes_tcc" ADD CONSTRAINT "orientacoes_tcc_id_professor_orientador_usuario_id_fk" FOREIGN KEY ("id_professor_orientador") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "arquivos_topico" ADD CONSTRAINT "arquivos_topico_id_mensagem_topico_mensagens_topico_id_fk" FOREIGN KEY ("id_mensagem_topico") REFERENCES "public"."mensagens_topico"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mensagens_topico" ADD CONSTRAINT "mensagens_topico_id_topico_topicos_atividades_id_fk" FOREIGN KEY ("id_topico") REFERENCES "public"."topicos_atividades"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mensagens_topico" ADD CONSTRAINT "mensagens_topico_id_autor_usuario_id_fk" FOREIGN KEY ("id_autor") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_cpf_unique" UNIQUE("cpf");