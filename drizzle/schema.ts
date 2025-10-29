import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

/**
 * Enums para PostgreSQL
 */
export const roleEnum = pgEnum("role", ["admin", "loja", "gestor"]);
export const tipoEnum = pgEnum("tipo", ["servico", "cobertura_ferias", "outros"]);
export const estadoPedidoEnum = pgEnum("estado_pedido", ["pendente_admin", "aprovado_admin", "confirmado", "cancelado", "rejeitado"]);
export const estadoAprovacaoEnum = pgEnum("estado_aprovacao", ["pendente", "aprovado", "rejeitado", "confirmado", "cancelado"]);
export const tipoNotificacaoEnum = pgEnum("tipo_notificacao", ["novo_pedido", "pedido_aprovado", "pedido_rejeitado", "pedido_confirmado", "pedido_cancelado"]);

/**
 * Core user table backing auth flow.
 * Extended with role-based access: admin, loja, gestor
 */
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("loja").notNull(),
  username: varchar("username", { length: 100 }).unique(),
  password: varchar("password", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  lojaId: integer("lojaId"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Lojas table - stores information about each store
 */
export const lojas = pgTable("lojas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nome: varchar("nome", { length: 200 }).notNull(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  contacto: varchar("contacto", { length: 100 }),
  morada: text("morada"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Loja = typeof lojas.$inferSelect;
export type InsertLoja = typeof lojas.$inferInsert;

/**
 * Pedidos table - stores support requests from stores
 */
export const pedidos = pgTable("pedidos", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  lojaId: integer("lojaId").notNull(),
  tipo: tipoEnum("tipo").notNull(),
  dataInicio: timestamp("dataInicio").notNull(),
  dataFim: timestamp("dataFim"),
  descricao: text("descricao"),
  estado: estadoPedidoEnum("estado").default("pendente_admin").notNull(),
  criadoPor: integer("criadoPor").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Pedido = typeof pedidos.$inferSelect;
export type InsertPedido = typeof pedidos.$inferInsert;

/**
 * Aprovacoes table - tracks approval workflow
 */
export const aprovacoes = pgTable("aprovacoes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pedidoId: integer("pedidoId").notNull(),
  adminId: integer("adminId"),
  gestorId: integer("gestorId"),
  estadoAdmin: estadoAprovacaoEnum("estadoAdmin").default("pendente"),
  estadoGestor: estadoAprovacaoEnum("estadoGestor").default("pendente"),
  observacoesAdmin: text("observacoesAdmin"),
  observacoesGestor: text("observacoesGestor"),
  dataAprovacaoAdmin: timestamp("dataAprovacaoAdmin"),
  dataAprovacaoGestor: timestamp("dataAprovacaoGestor"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Aprovacao = typeof aprovacoes.$inferSelect;
export type InsertAprovacao = typeof aprovacoes.$inferInsert;

/**
 * Notificacoes table - tracks WhatsApp notifications sent
 */
export const notificacoes = pgTable("notificacoes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  pedidoId: integer("pedidoId").notNull(),
  tipo: tipoNotificacaoEnum("tipo").notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  mensagem: text("mensagem").notNull(),
  enviada: boolean("enviada").default(false).notNull(),
  enviadaEm: timestamp("enviadaEm"),
  erro: text("erro"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;

/**
 * Indisponibilidades table - gestor can mark days as unavailable
 */
export const indisponibilidades = pgTable("indisponibilidades", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  gestorId: integer("gestorId").notNull(),
  dataInicio: timestamp("dataInicio").notNull(),
  dataFim: timestamp("dataFim").notNull(),
  motivo: text("motivo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Indisponibilidade = typeof indisponibilidades.$inferSelect;
export type InsertIndisponibilidade = typeof indisponibilidades.$inferInsert;
