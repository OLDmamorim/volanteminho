import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, datetime } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access: admin, loja, gestor
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "loja", "gestor"]).default("loja").notNull(),
  username: varchar("username", { length: 100 }).unique(),
  password: varchar("password", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  lojaId: int("lojaId"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Lojas table - stores information about each store
 */
export const lojas = mysqlTable("lojas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  contacto: varchar("contacto", { length: 100 }),
  morada: text("morada"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Loja = typeof lojas.$inferSelect;
export type InsertLoja = typeof lojas.$inferInsert;

/**
 * Pedidos table - stores support requests from stores
 */
export const pedidos = mysqlTable("pedidos", {
  id: int("id").autoincrement().primaryKey(),
  lojaId: int("lojaId").notNull(),
  tipo: mysqlEnum("tipo", ["servico", "cobertura_ferias", "outros"]).notNull(),
  dataInicio: datetime("dataInicio").notNull(),
  dataFim: datetime("dataFim"),
  descricao: text("descricao"),
  estado: mysqlEnum("estado", [
    "pendente_admin",
    "aprovado_admin",
    "confirmado",
    "cancelado",
    "rejeitado"
  ]).default("pendente_admin").notNull(),
  criadoPor: int("criadoPor").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pedido = typeof pedidos.$inferSelect;
export type InsertPedido = typeof pedidos.$inferInsert;

/**
 * Aprovacoes table - tracks approval workflow
 */
export const aprovacoes = mysqlTable("aprovacoes", {
  id: int("id").autoincrement().primaryKey(),
  pedidoId: int("pedidoId").notNull(),
  adminId: int("adminId"),
  gestorId: int("gestorId"),
  estadoAdmin: mysqlEnum("estadoAdmin", ["pendente", "aprovado", "rejeitado"]).default("pendente"),
  estadoGestor: mysqlEnum("estadoGestor", ["pendente", "confirmado", "cancelado"]).default("pendente"),
  observacoesAdmin: text("observacoesAdmin"),
  observacoesGestor: text("observacoesGestor"),
  dataAprovacaoAdmin: timestamp("dataAprovacaoAdmin"),
  dataAprovacaoGestor: timestamp("dataAprovacaoGestor"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Aprovacao = typeof aprovacoes.$inferSelect;
export type InsertAprovacao = typeof aprovacoes.$inferInsert;

/**
 * Notificacoes table - tracks WhatsApp notifications sent
 */
export const notificacoes = mysqlTable("notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pedidoId: int("pedidoId").notNull(),
  tipo: mysqlEnum("tipo", [
    "novo_pedido",
    "pedido_aprovado",
    "pedido_rejeitado",
    "pedido_confirmado",
    "pedido_cancelado"
  ]).notNull(),
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
export const indisponibilidades = mysqlTable("indisponibilidades", {
  id: int("id").autoincrement().primaryKey(),
  gestorId: int("gestorId").notNull(),
  dataInicio: datetime("dataInicio").notNull(),
  dataFim: datetime("dataFim").notNull(),
  motivo: text("motivo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Indisponibilidade = typeof indisponibilidades.$inferSelect;
export type InsertIndisponibilidade = typeof indisponibilidades.$inferInsert;
