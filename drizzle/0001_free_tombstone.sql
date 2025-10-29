CREATE TABLE `aprovacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pedidoId` int NOT NULL,
	`adminId` int,
	`gestorId` int,
	`estadoAdmin` enum('pendente','aprovado','rejeitado') DEFAULT 'pendente',
	`estadoGestor` enum('pendente','confirmado','cancelado') DEFAULT 'pendente',
	`observacoesAdmin` text,
	`observacoesGestor` text,
	`dataAprovacaoAdmin` timestamp,
	`dataAprovacaoGestor` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aprovacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `indisponibilidades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gestorId` int NOT NULL,
	`dataInicio` datetime NOT NULL,
	`dataFim` datetime NOT NULL,
	`motivo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `indisponibilidades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lojas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(200) NOT NULL,
	`codigo` varchar(50) NOT NULL,
	`contacto` varchar(100),
	`morada` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lojas_id` PRIMARY KEY(`id`),
	CONSTRAINT `lojas_codigo_unique` UNIQUE(`codigo`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pedidoId` int NOT NULL,
	`tipo` enum('novo_pedido','pedido_aprovado','pedido_rejeitado','pedido_confirmado','pedido_cancelado') NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`mensagem` text NOT NULL,
	`enviada` boolean NOT NULL DEFAULT false,
	`enviadaEm` timestamp,
	`erro` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedidos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lojaId` int NOT NULL,
	`tipo` enum('servico','cobertura_ferias','outros') NOT NULL,
	`dataInicio` datetime NOT NULL,
	`dataFim` datetime,
	`descricao` text,
	`estado` enum('pendente_admin','aprovado_admin','confirmado','cancelado','rejeitado') NOT NULL DEFAULT 'pendente_admin',
	`criadoPor` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pedidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','loja','gestor') NOT NULL DEFAULT 'loja';--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `whatsapp` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `lojaId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `active` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);