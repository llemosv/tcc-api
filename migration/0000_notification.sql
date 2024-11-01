CREATE TABLE IF NOT EXISTS "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"semesters" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_tipo_notificacao" uuid NOT NULL,
	"id_usuario_remetente" uuid NOT NULL,
	"id_usuario_destinatario" uuid NOT NULL,
	"mensagem" varchar(254) NOT NULL,
	"lida" boolean DEFAULT false NOT NULL,
	"id_referencia" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text,
	"email" varchar(255),
	"senha" text,
	"fl_ativo" boolean,
	"id_tipo_pessoa" uuid NOT NULL,
	CONSTRAINT "people_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people_courses" (
	"people_id" uuid NOT NULL,
	"course_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_task" uuid NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"descricao" text NOT NULL,
	"data_criacao" date NOT NULL,
	"previsao_entrega" date NOT NULL,
	"data_finalizacao" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_tcc" uuid NOT NULL,
	"tarefa" varchar(255) NOT NULL,
	"data_criacao" date NOT NULL,
	"previsao_entrega" date NOT NULL,
	"data_finalizacao" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tcc_guidances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_aluno_solicitante" uuid NOT NULL,
	"id_professor_orientador" uuid NOT NULL,
	"solicitacao_aceita" boolean NOT NULL,
	"tema" varchar(255) NOT NULL,
	"previsao_entrega" date NOT NULL,
	"justificativa_reprovacao" text,
	"data_aprovacao" date,
	"data_reprovacao" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "topic_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_topic_messages" uuid NOT NULL,
	"nome_arquivo" varchar(255) NOT NULL,
	"caminho" text NOT NULL,
	"data_upload" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "topic_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_topic" uuid NOT NULL,
	"id_autor" uuid NOT NULL,
	"conteudo" text NOT NULL,
	"data_criacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_id_tipo_notificacao_notification_type_id_fk" FOREIGN KEY ("id_tipo_notificacao") REFERENCES "public"."notification_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_id_usuario_remetente_people_id_fk" FOREIGN KEY ("id_usuario_remetente") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_id_usuario_destinatario_people_id_fk" FOREIGN KEY ("id_usuario_destinatario") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "people" ADD CONSTRAINT "people_id_tipo_pessoa_people_types_id_fk" FOREIGN KEY ("id_tipo_pessoa") REFERENCES "public"."people_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "people_courses" ADD CONSTRAINT "people_courses_people_id_people_id_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "people_courses" ADD CONSTRAINT "people_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_topics" ADD CONSTRAINT "task_topics_id_task_tasks_id_fk" FOREIGN KEY ("id_task") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_id_tcc_tcc_guidances_id_fk" FOREIGN KEY ("id_tcc") REFERENCES "public"."tcc_guidances"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tcc_guidances" ADD CONSTRAINT "tcc_guidances_id_aluno_solicitante_people_id_fk" FOREIGN KEY ("id_aluno_solicitante") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tcc_guidances" ADD CONSTRAINT "tcc_guidances_id_professor_orientador_people_id_fk" FOREIGN KEY ("id_professor_orientador") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topic_files" ADD CONSTRAINT "topic_files_id_topic_messages_topic_messages_id_fk" FOREIGN KEY ("id_topic_messages") REFERENCES "public"."topic_messages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topic_messages" ADD CONSTRAINT "topic_messages_id_topic_task_topics_id_fk" FOREIGN KEY ("id_topic") REFERENCES "public"."task_topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topic_messages" ADD CONSTRAINT "topic_messages_id_autor_people_id_fk" FOREIGN KEY ("id_autor") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
