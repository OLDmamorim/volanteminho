CREATE TYPE "public"."estado_aprovacao" AS ENUM('pendente', 'aprovado', 'rejeitado', 'confirmado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."estado_pedido" AS ENUM('pendente_admin', 'aprovado_admin', 'confirmado', 'cancelado', 'rejeitado');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'loja', 'gestor');--> statement-breakpoint
CREATE TYPE "public"."tipo" AS ENUM('servico', 'cobertura_ferias', 'outros');--> statement-breakpoint
CREATE TYPE "public"."tipo_notificacao" AS ENUM('novo_pedido', 'pedido_aprovado', 'pedido_rejeitado', 'pedido_confirmado', 'pedido_cancelado');--> statement-breakpoint
CREATE TABLE "aprovacoes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "aprovacoes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pedidoId" integer NOT NULL,
	"adminId" integer,
	"gestorId" integer,
	"estadoAdmin" "estado_aprovacao" DEFAULT 'pendente',
	"estadoGestor" "estado_aprovacao" DEFAULT 'pendente',
	"observacoesAdmin" text,
	"observacoesGestor" text,
	"dataAprovacaoAdmin" timestamp,
	"dataAprovacaoGestor" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indisponibilidades" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "indisponibilidades_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"gestorId" integer NOT NULL,
	"dataInicio" timestamp NOT NULL,
	"dataFim" timestamp NOT NULL,
	"motivo" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lojas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lojas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nome" varchar(200) NOT NULL,
	"codigo" varchar(50) NOT NULL,
	"contacto" varchar(100),
	"morada" text,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lojas_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "notificacoes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notificacoes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"pedidoId" integer NOT NULL,
	"tipo" "tipo_notificacao" NOT NULL,
	"whatsapp" varchar(20) NOT NULL,
	"mensagem" text NOT NULL,
	"enviada" boolean DEFAULT false NOT NULL,
	"enviadaEm" timestamp,
	"erro" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pedidos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"lojaId" integer NOT NULL,
	"tipo" "tipo" NOT NULL,
	"dataInicio" timestamp NOT NULL,
	"dataFim" timestamp,
	"descricao" text,
	"estado" "estado_pedido" DEFAULT 'pendente_admin' NOT NULL,
	"criadoPor" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'loja' NOT NULL,
	"username" varchar(100),
	"password" varchar(255),
	"whatsapp" varchar(20),
	"lojaId" integer,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
