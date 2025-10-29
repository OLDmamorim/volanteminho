import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
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
let _pool: Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const config: any = { connectionString: process.env.DATABASE_URL };
      if (process.env.DATABASE_URL?.includes('sslmode=require')) {
        config.ssl = { rejectUnauthorized: false };
      }
      _pool = new Pool(config);
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
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

    const textFields = ["name", "email", "loginMethod"] as const;
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

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
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
  if (!_pool) {
    if (!process.env.DATABASE_URL) return undefined;
    // Parse connection string manually to avoid SSL issues
    const url = new URL(process.env.DATABASE_URL!);
    const poolConfig: any = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1).split('?')[0],
      user: url.username,
      password: decodeURIComponent(url.password)
    };
    // Only enable SSL if explicitly required
    if (process.env.DATABASE_URL.includes('sslmode=require')) {
      poolConfig.ssl = { rejectUnauthorized: false };
    }
    _pool = new Pool(poolConfig);
  }
  const result = await _pool.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
  return result.rows[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values(user).returning();
  return result[0];
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return result[0];
}

export async function listUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}

// === LOJAS ===
export async function createLoja(loja: InsertLoja) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lojas).values(loja).returning();
  return result[0];
}

export async function getLojaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lojas).where(eq(lojas.id, id)).limit(1);
  return result[0];
}

export async function listLojas() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lojas);
}

export async function updateLoja(id: number, data: Partial<InsertLoja>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(lojas).set(data).where(eq(lojas.id, id)).returning();
  return result[0];
}

// === PEDIDOS ===
export async function createPedido(pedido: InsertPedido) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pedidos).values(pedido).returning();
  return result[0];
}

export async function getPedidoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pedidos).where(eq(pedidos.id, id)).limit(1);
  return result[0];
}

export async function listPedidos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pedidos);
}

export async function updatePedido(id: number, data: Partial<InsertPedido>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(pedidos).set(data).where(eq(pedidos.id, id)).returning();
  return result[0];
}

// === APROVACOES ===
export async function createAprovacao(aprovacao: InsertAprovacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aprovacoes).values(aprovacao).returning();
  return result[0];
}

export async function updateAprovacao(id: number, data: Partial<InsertAprovacao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(aprovacoes).set(data).where(eq(aprovacoes.id, id)).returning();
  return result[0];
}

// === NOTIFICACOES ===
export async function createNotificacao(notificacao: InsertNotificacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notificacoes).values(notificacao).returning();
  return result[0];
}

// === INDISPONIBILIDADES ===
export async function createIndisponibilidade(indisponibilidade: InsertIndisponibilidade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(indisponibilidades).values(indisponibilidade).returning();
  return result[0];
}

export async function listIndisponibilidades() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(indisponibilidades);
}

// Aliases for compatibility
export async function getAllUsers() {
  return listUsers();
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(users).where(eq(users.id, id));
}

export async function getAllLojas() {
  return listLojas();
}

export async function deleteLoja(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(lojas).where(eq(lojas.id, id));
}

export async function getAllPedidos() {
  return listPedidos();
}

export async function getPedidosByLoja(lojaId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pedidos).where(eq(pedidos.lojaId, lojaId));
}

export async function getAprovacaoByPedidoId(pedidoId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(aprovacoes).where(eq(aprovacoes.pedidoId, pedidoId)).limit(1);
  return result[0];
}

export async function getIndisponibilidadesByGestor(gestorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(indisponibilidades).where(eq(indisponibilidades.gestorId, gestorId));
}

export async function deleteIndisponibilidade(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(indisponibilidades).where(eq(indisponibilidades.id, id));
}
