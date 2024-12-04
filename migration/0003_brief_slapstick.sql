ALTER TABLE "people" ADD COLUMN "cpf" varchar(11);--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_cpf_unique" UNIQUE("cpf");