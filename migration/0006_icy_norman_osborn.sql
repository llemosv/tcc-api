ALTER TABLE "arquivos_topico" RENAME COLUMN "id_mensagem_topico" TO "id_topico";--> statement-breakpoint
ALTER TABLE "arquivos_topico" DROP CONSTRAINT "arquivos_topico_id_mensagem_topico_mensagens_topico_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "arquivos_topico" ADD CONSTRAINT "arquivos_topico_id_topico_topicos_atividades_id_fk" FOREIGN KEY ("id_topico") REFERENCES "public"."topicos_atividades"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
