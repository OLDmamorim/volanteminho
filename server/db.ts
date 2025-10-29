import { eq, and, desc, gte, lte, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  lojas, 
  InsertLoja, 
  pedidos, 
  InsertPedido, 
  aprovacoes, 
  InsertAprovacao,
  notificacoes,
  InsertNotificacao,
  indisponibilidades,
  InsertIndisponibilidade
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "username", "password", "whatsapp"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.lojaId !== undefined) {
      values.lojaId = user.lojaId;
      updateSet.lojaId = user.lojaId;
    }
    if (user.active !== undefined) {
      values.active = user.active;
      updateSet.active = user.active;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// === USERS ===
export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function createUser(data: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values(data);
  return result;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(users).where(eq(users.id, id));
}

// === LOJAS ===
export async function getAllLojas() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lojas).orderBy(lojas.nome);
}

export async function getLojaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lojas).where(eq(lojas.id, id)).limit(1);
  return result[0];
}

export async function createLoja(data: InsertLoja) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lojas).values(data);
  return result;
}

export async function updateLoja(id: number, data: Partial<InsertLoja>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lojas).set(data).where(eq(lojas.id, id));
}

export async function deleteLoja(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(lojas).where(eq(lojas.id, id));
}

// === PEDIDOS ===
export async function getAllPedidos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pedidos).orderBy(desc(pedidos.createdAt));
}

export async function getPedidoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pedidos).where(eq(pedidos.id, id)).limit(1);
  return result[0];
}

export async function getPedidosByLoja(lojaId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pedidos).where(eq(pedidos.lojaId, lojaId)).orderBy(desc(pedidos.createdAt));
}

export async function getPedidosByEstado(estado: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pedidos).where(eq(pedidos.estado, estado as any)).orderBy(desc(pedidos.createdAt));
}

export async function createPedido(data: InsertPedido) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pedidos).values(data);
  return result;
}

export async function updatePedido(id: number, data: Partial<InsertPedido>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pedidos).set(data).where(eq(pedidos.id, id));
}

export async function deletePedido(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pedidos).where(eq(pedidos.id, id));
}

// === APROVACOES ===
export async function getAprovacaoByPedidoId(pedidoId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(aprovacoes).where(eq(aprovacoes.pedidoId, pedidoId)).limit(1);
  return result[0];
}

export async function createAprovacao(data: InsertAprovacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aprovacoes).values(data);
  return result;
}

export async function updateAprovacao(id: number, data: Partial<InsertAprovacao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(aprovacoes).set(data).where(eq(aprovacoes.id, id));
}

// === NOTIFICACOES ===
export async function createNotificacao(data: InsertNotificacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notificacoes).values(data);
  return result;
}

export async function getNotificacoesPendentes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notificacoes).where(eq(notificacoes.enviada, false)).orderBy(notificacoes.createdAt);
}

export async function updateNotificacao(id: number, data: Partial<InsertNotificacao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notificacoes).set(data).where(eq(notificacoes.id, id));
}

// === INDISPONIBILIDADES ===
export async function getIndisponibilidadesByGestor(gestorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(indisponibilidades).where(eq(indisponibilidades.gestorId, gestorId)).orderBy(indisponibilidades.dataInicio);
}

export async function getIndisponibilidadesInRange(gestorId: number, dataInicio: Date, dataFim: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(indisponibilidades).where(
    and(
      eq(indisponibilidades.gestorId, gestorId),
      or(
        and(gte(indisponibilidades.dataInicio, dataInicio), lte(indisponibilidades.dataInicio, dataFim)),
        and(gte(indisponibilidades.dataFim, dataInicio), lte(indisponibilidades.dataFim, dataFim))
      )
    )
  );
}

export async function createIndisponibilidade(data: InsertIndisponibilidade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(indisponibilidades).values(data);
  return result;
}

export async function deleteIndisponibilidade(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(indisponibilidades).where(eq(indisponibilidades.id, id));
}
