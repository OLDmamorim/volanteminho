var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/const.ts
var COOKIE_NAME, ONE_YEAR_MS, AXIOS_TIMEOUT_MS, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG;
var init_const = __esm({
  "shared/const.ts"() {
    "use strict";
    COOKIE_NAME = "app_session_id";
    ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
    AXIOS_TIMEOUT_MS = 3e4;
    UNAUTHED_ERR_MSG = "Please login (10001)";
    NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
  }
});

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}
var init_cookies = __esm({
  "server/_core/cookies.ts"() {
    "use strict";
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// drizzle/schema.ts
import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
var roleEnum, tipoEnum, estadoPedidoEnum, estadoAprovacaoEnum, tipoNotificacaoEnum, users, lojas, pedidos, aprovacoes, notificacoes, indisponibilidades;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    roleEnum = pgEnum("role", ["admin", "loja", "gestor"]);
    tipoEnum = pgEnum("tipo", ["servico", "cobertura_ferias", "outros"]);
    estadoPedidoEnum = pgEnum("estado_pedido", ["pendente_admin", "aprovado_admin", "confirmado", "cancelado", "rejeitado"]);
    estadoAprovacaoEnum = pgEnum("estado_aprovacao", ["pendente", "aprovado", "rejeitado", "confirmado", "cancelado"]);
    tipoNotificacaoEnum = pgEnum("tipo_notificacao", ["novo_pedido", "pedido_aprovado", "pedido_rejeitado", "pedido_confirmado", "pedido_cancelado"]);
    users = pgTable("users", {
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
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    lojas = pgTable("lojas", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      nome: varchar("nome", { length: 200 }).notNull(),
      codigo: varchar("codigo", { length: 50 }).notNull().unique(),
      contacto: varchar("contacto", { length: 100 }),
      morada: text("morada"),
      active: boolean("active").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    pedidos = pgTable("pedidos", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      lojaId: integer("lojaId").notNull(),
      tipo: tipoEnum("tipo").notNull(),
      dataInicio: timestamp("dataInicio").notNull(),
      dataFim: timestamp("dataFim"),
      descricao: text("descricao"),
      estado: estadoPedidoEnum("estado").default("pendente_admin").notNull(),
      criadoPor: integer("criadoPor").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    aprovacoes = pgTable("aprovacoes", {
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
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    notificacoes = pgTable("notificacoes", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      userId: integer("userId").notNull(),
      pedidoId: integer("pedidoId").notNull(),
      tipo: tipoNotificacaoEnum("tipo").notNull(),
      whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
      mensagem: text("mensagem").notNull(),
      enviada: boolean("enviada").default(false).notNull(),
      enviadaEm: timestamp("enviadaEm"),
      erro: text("erro"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    indisponibilidades = pgTable("indisponibilidades", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      gestorId: integer("gestorId").notNull(),
      dataInicio: timestamp("dataInicio").notNull(),
      dataFim: timestamp("dataFim").notNull(),
      motivo: text("motivo"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
  }
});

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const config = { connectionString: process.env.DATABASE_URL };
      if (process.env.DATABASE_URL?.includes("sslmode=require")) {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByUsername(username) {
  if (!_pool) {
    if (!process.env.DATABASE_URL) return void 0;
    const url = new URL(process.env.DATABASE_URL);
    const poolConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1).split("?")[0],
      user: url.username,
      password: decodeURIComponent(url.password)
    };
    if (process.env.DATABASE_URL.includes("sslmode=require")) {
      poolConfig.ssl = { rejectUnauthorized: false };
    }
    _pool = new Pool(poolConfig);
  }
  const result = await _pool.query("SELECT * FROM users WHERE username = $1 LIMIT 1", [username]);
  return result.rows[0];
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}
async function createUser(user) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values(user).returning();
  return result[0];
}
async function updateUser(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return result[0];
}
async function listUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}
async function createLoja(loja) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lojas).values(loja).returning();
  return result[0];
}
async function getLojaById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(lojas).where(eq(lojas.id, id)).limit(1);
  return result[0];
}
async function listLojas() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lojas);
}
async function updateLoja(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(lojas).set(data).where(eq(lojas.id, id)).returning();
  return result[0];
}
async function createPedido(pedido) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pedidos).values(pedido).returning();
  return result[0];
}
async function getPedidoById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(pedidos).where(eq(pedidos.id, id)).limit(1);
  return result[0];
}
async function listPedidos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pedidos);
}
async function updatePedido(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(pedidos).set(data).where(eq(pedidos.id, id)).returning();
  return result[0];
}
async function createAprovacao(aprovacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aprovacoes).values(aprovacao).returning();
  return result[0];
}
async function updateAprovacao(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(aprovacoes).set(data).where(eq(aprovacoes.id, id)).returning();
  return result[0];
}
async function createNotificacao(notificacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notificacoes).values(notificacao).returning();
  return result[0];
}
async function createIndisponibilidade(indisponibilidade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(indisponibilidades).values(indisponibilidade).returning();
  return result[0];
}
async function getAllUsers() {
  return listUsers();
}
async function deleteUser(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(users).where(eq(users.id, id));
}
async function getAllLojas() {
  return listLojas();
}
async function deleteLoja(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(lojas).where(eq(lojas.id, id));
}
async function getAllPedidos() {
  return listPedidos();
}
async function getPedidosByLoja(lojaId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pedidos).where(eq(pedidos.lojaId, lojaId));
}
async function getAprovacaoByPedidoId(pedidoId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(aprovacoes).where(eq(aprovacoes.pedidoId, pedidoId)).limit(1);
  return result[0];
}
async function getIndisponibilidadesByGestor(gestorId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(indisponibilidades).where(eq(indisponibilidades.gestorId, gestorId));
}
async function deleteIndisponibilidade(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(indisponibilidades).where(eq(indisponibilidades.id, id));
}
var _db, _pool;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
    _pool = null;
  }
});

// shared/_core/errors.ts
var HttpError, ForbiddenError;
var init_errors = __esm({
  "shared/_core/errors.ts"() {
    "use strict";
    HttpError = class extends Error {
      constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "HttpError";
      }
    };
    ForbiddenError = (msg) => new HttpError(403, msg);
  }
});

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2, EXCHANGE_TOKEN_PATH, GET_USER_INFO_PATH, GET_USER_INFO_WITH_JWT_PATH, OAuthService, createOAuthHttpClient, SDKServer, sdk;
var init_sdk = __esm({
  "server/_core/sdk.ts"() {
    "use strict";
    init_const();
    init_errors();
    init_db();
    init_env();
    isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
    EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
    GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
    GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
    OAuthService = class {
      constructor(client) {
        this.client = client;
        console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
        if (!ENV.oAuthServerUrl) {
          console.error(
            "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
          );
        }
      }
      decodeState(state) {
        const redirectUri = atob(state);
        return redirectUri;
      }
      async getTokenByCode(code, state) {
        const payload = {
          clientId: ENV.appId,
          grantType: "authorization_code",
          code,
          redirectUri: this.decodeState(state)
        };
        const { data } = await this.client.post(
          EXCHANGE_TOKEN_PATH,
          payload
        );
        return data;
      }
      async getUserInfoByToken(token) {
        const { data } = await this.client.post(
          GET_USER_INFO_PATH,
          {
            accessToken: token.accessToken
          }
        );
        return data;
      }
    };
    createOAuthHttpClient = () => axios.create({
      baseURL: ENV.oAuthServerUrl,
      timeout: AXIOS_TIMEOUT_MS
    });
    SDKServer = class {
      client;
      oauthService;
      constructor(client = createOAuthHttpClient()) {
        this.client = client;
        this.oauthService = new OAuthService(this.client);
      }
      deriveLoginMethod(platforms, fallback) {
        if (fallback && fallback.length > 0) return fallback;
        if (!Array.isArray(platforms) || platforms.length === 0) return null;
        const set = new Set(
          platforms.filter((p) => typeof p === "string")
        );
        if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
        if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
        if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
        if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
          return "microsoft";
        if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
        const first = Array.from(set)[0];
        return first ? first.toLowerCase() : null;
      }
      /**
       * Exchange OAuth authorization code for access token
       * @example
       * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
       */
      async exchangeCodeForToken(code, state) {
        return this.oauthService.getTokenByCode(code, state);
      }
      /**
       * Get user information using access token
       * @example
       * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
       */
      async getUserInfo(accessToken) {
        const data = await this.oauthService.getUserInfoByToken({
          accessToken
        });
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
      }
      parseCookies(cookieHeader) {
        if (!cookieHeader) {
          return /* @__PURE__ */ new Map();
        }
        const parsed = parseCookieHeader(cookieHeader);
        return new Map(Object.entries(parsed));
      }
      getSessionSecret() {
        const secret = ENV.cookieSecret;
        return new TextEncoder().encode(secret);
      }
      /**
       * Create a session token for a Manus user openId
       * @example
       * const sessionToken = await sdk.createSessionToken(userInfo.openId);
       */
      async createSessionToken(openId, options = {}) {
        return this.signSession(
          {
            openId,
            appId: ENV.appId,
            name: options.name || ""
          },
          options
        );
      }
      async signSession(payload, options = {}) {
        const issuedAt = Date.now();
        const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
        const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
        const secretKey = this.getSessionSecret();
        return new SignJWT({
          openId: payload.openId,
          appId: payload.appId,
          name: payload.name
        }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
      }
      async verifySession(cookieValue) {
        if (!cookieValue) {
          console.warn("[Auth] Missing session cookie");
          return null;
        }
        try {
          const secretKey = this.getSessionSecret();
          const { payload } = await jwtVerify(cookieValue, secretKey, {
            algorithms: ["HS256"]
          });
          const { openId, appId, name } = payload;
          if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
            console.warn("[Auth] Session payload missing required fields");
            return null;
          }
          return {
            openId,
            appId,
            name
          };
        } catch (error) {
          console.warn("[Auth] Session verification failed", String(error));
          return null;
        }
      }
      async getUserInfoWithJwt(jwtToken) {
        const payload = {
          jwtToken,
          projectId: ENV.appId
        };
        const { data } = await this.client.post(
          GET_USER_INFO_WITH_JWT_PATH,
          payload
        );
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
      }
      async authenticateRequest(req) {
        const cookies = this.parseCookies(req.headers.cookie);
        const sessionCookie = cookies.get(COOKIE_NAME);
        const session = await this.verifySession(sessionCookie);
        if (!session) {
          throw ForbiddenError("Invalid session cookie");
        }
        const sessionUserId = session.openId;
        const signedInAt = /* @__PURE__ */ new Date();
        let user = await getUserByOpenId(sessionUserId);
        if (!user) {
          try {
            const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
            await upsertUser({
              openId: userInfo.openId,
              name: userInfo.name || null,
              email: userInfo.email ?? null,
              loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
              lastSignedIn: signedInAt
            });
            user = await getUserByOpenId(userInfo.openId);
          } catch (error) {
            console.error("[Auth] Failed to sync user from OAuth:", error);
            throw ForbiddenError("Failed to sync user info");
          }
        }
        if (!user) {
          throw ForbiddenError("User not found");
        }
        await upsertUser({
          openId: user.openId,
          lastSignedIn: signedInAt
        });
        return user;
      }
    };
    sdk = new SDKServer();
  }
});

// server/_core/oauth.ts
var oauth_exports = {};
__export(oauth_exports, {
  registerOAuthRoutes: () => registerOAuthRoutes
});
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
var init_oauth = __esm({
  "server/_core/oauth.ts"() {
    "use strict";
    init_const();
    init_db();
    init_cookies();
    init_sdk();
  }
});

// netlify/functions/server.ts
import express from "express";
import serverlessHttp from "serverless-http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/routers.ts
init_const();
init_cookies();

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
init_const();
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_db();
import { z as z2 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/whatsapp.ts
async function sendWhatsAppMessage({ to, message }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";
  if (!accountSid || !authToken) {
    console.warn("[WhatsApp] Twilio credentials not configured. Skipping message.");
    return false;
  }
  try {
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const formattedFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams({
      From: formattedFrom,
      To: formattedTo,
      Body: message
    });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });
    if (!response.ok) {
      const error = await response.text();
      console.error("[WhatsApp] Failed to send message:", error);
      return false;
    }
    const result = await response.json();
    console.log("[WhatsApp] Message sent successfully:", result.sid);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error);
    return false;
  }
}
function getWhatsAppTemplate(tipo, data) {
  const templates = {
    novo_pedido: `\u{1F514} *Novo Pedido de Apoio*

Loja: ${data.lojaNome}
Tipo: ${data.tipo}
Data: ${data.dataInicio}
${data.descricao ? `Descri\xE7\xE3o: ${data.descricao}` : ""}

\u{1F449} Aceder ao portal: ${data.portalUrl}`,
    pedido_aprovado: `\u2705 *Pedido Aprovado pelo Admin*

Loja: ${data.lojaNome}
Tipo: ${data.tipo}
Data: ${data.dataInicio}
${data.observacoes ? `Observa\xE7\xF5es: ${data.observacoes}` : ""}

Por favor confirme ou cancele este pedido no portal.

\u{1F449} Aceder ao portal: ${data.portalUrl}`,
    pedido_rejeitado: `\u274C *Pedido Rejeitado*

Loja: ${data.lojaNome}
Tipo: ${data.tipo}
Data: ${data.dataInicio}
${data.observacoes ? `Motivo: ${data.observacoes}` : ""}

Para mais informa\xE7\xF5es, aceda ao portal.

\u{1F449} ${data.portalUrl}`,
    pedido_confirmado: `\u2705 *Pedido Confirmado*

O seu pedido de apoio foi confirmado!

Tipo: ${data.tipo}
Data: ${data.dataInicio}
${data.observacoes ? `Observa\xE7\xF5es: ${data.observacoes}` : ""}

\u{1F449} Ver detalhes: ${data.portalUrl}`,
    pedido_cancelado: `\u26A0\uFE0F *Pedido Cancelado*

O seu pedido de apoio foi cancelado.

Tipo: ${data.tipo}
Data: ${data.dataInicio}
${data.observacoes ? `Motivo: ${data.observacoes}` : ""}

\u{1F449} Ver detalhes: ${data.portalUrl}`
  };
  return templates[tipo];
}

// server/routers.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso apenas para administradores" });
  }
  return next({ ctx });
});
var gestorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "gestor") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso apenas para gestores" });
  }
  return next({ ctx });
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    login: publicProcedure.input(z2.object({
      username: z2.string(),
      password: z2.string()
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByUsername(input.username);
      if (!user || !user.password) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Credenciais inv\xE1lidas" });
      }
      const validPassword = await bcrypt.compare(input.password, user.password);
      if (!validPassword) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Credenciais inv\xE1lidas" });
      }
      if (!user.active) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Utilizador inativo" });
      }
      const token = jwt.sign(
        { userId: user.id, openId: user.openId || `local-${user.id}`, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
      return { success: true, user };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // === USERS ===
  users: router({
    list: adminProcedure2.query(async () => {
      return getAllUsers();
    }),
    create: adminProcedure2.input(z2.object({
      username: z2.string(),
      password: z2.string(),
      name: z2.string().optional(),
      email: z2.string().email().optional(),
      role: z2.enum(["admin", "loja", "gestor"]),
      whatsapp: z2.string().optional(),
      lojaId: z2.number().optional()
    })).mutation(async ({ input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      await createUser({
        openId: `local_${input.username}_${Date.now()}`,
        username: input.username,
        password: hashedPassword,
        name: input.name || null,
        email: input.email || null,
        role: input.role,
        whatsapp: input.whatsapp || null,
        lojaId: input.lojaId || null,
        active: true
      });
      return { success: true };
    }),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      username: z2.string().optional(),
      password: z2.string().optional(),
      name: z2.string().optional(),
      email: z2.string().optional(),
      role: z2.enum(["admin", "loja", "gestor"]).optional(),
      whatsapp: z2.string().optional(),
      lojaId: z2.number().optional(),
      active: z2.boolean().optional()
    })).mutation(async ({ input }) => {
      const { id, password, ...rest } = input;
      const updateData = { ...rest };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      await updateUser(id, updateData);
      return { success: true };
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deleteUser(input.id);
      return { success: true };
    })
  }),
  // === LOJAS ===
  lojas: router({
    list: protectedProcedure.query(async () => {
      return getAllLojas();
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getLojaById(input.id);
    }),
    create: adminProcedure2.input(z2.object({
      nome: z2.string(),
      codigo: z2.string(),
      contacto: z2.string().optional(),
      morada: z2.string().optional()
    })).mutation(async ({ input }) => {
      await createLoja({
        nome: input.nome,
        codigo: input.codigo,
        contacto: input.contacto || null,
        morada: input.morada || null,
        active: true
      });
      return { success: true };
    }),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      nome: z2.string().optional(),
      codigo: z2.string().optional(),
      contacto: z2.string().optional(),
      morada: z2.string().optional(),
      active: z2.boolean().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateLoja(id, data);
      return { success: true };
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deleteLoja(input.id);
      return { success: true };
    })
  }),
  // === PEDIDOS ===
  pedidos: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin" || ctx.user.role === "gestor") {
        return getAllPedidos();
      } else if (ctx.user.role === "loja" && ctx.user.lojaId) {
        return getPedidosByLoja(ctx.user.lojaId);
      }
      return [];
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input, ctx }) => {
      const pedido = await getPedidoById(input.id);
      if (!pedido) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Pedido n\xE3o encontrado" });
      }
      if (ctx.user.role === "loja" && pedido.lojaId !== ctx.user.lojaId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Sem permiss\xE3o para ver este pedido" });
      }
      return pedido;
    }),
    create: protectedProcedure.input(z2.object({
      tipo: z2.enum(["servico", "cobertura_ferias", "outros"]),
      dataInicio: z2.string(),
      dataFim: z2.string().optional(),
      descricao: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "loja" || !ctx.user.lojaId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Apenas lojas podem criar pedidos" });
      }
      const result = await createPedido({
        lojaId: ctx.user.lojaId,
        tipo: input.tipo,
        dataInicio: new Date(input.dataInicio),
        dataFim: input.dataFim ? new Date(input.dataFim) : null,
        descricao: input.descricao || null,
        estado: "pendente_admin",
        criadoPor: ctx.user.id
      });
      const pedidoId = Number(result.insertId);
      await createAprovacao({
        pedidoId,
        estadoAdmin: "pendente",
        estadoGestor: "pendente"
      });
      const loja = await getLojaById(ctx.user.lojaId);
      const admins = (await getAllUsers()).filter((u) => u.role === "admin");
      for (const admin of admins) {
        if (admin.whatsapp) {
          const message = getWhatsAppTemplate("novo_pedido", {
            lojaNome: loja?.nome || "Desconhecida",
            tipo: input.tipo,
            dataInicio: new Date(input.dataInicio).toLocaleDateString("pt-PT"),
            descricao: input.descricao,
            portalUrl: process.env.VITE_APP_URL || "https://portal-apoio-lojas.manus.space"
          });
          const sent = await sendWhatsAppMessage({
            to: admin.whatsapp,
            message
          });
          await createNotificacao({
            userId: admin.id,
            pedidoId,
            tipo: "novo_pedido",
            whatsapp: admin.whatsapp,
            mensagem: message,
            enviada: sent,
            enviadaEm: sent ? /* @__PURE__ */ new Date() : null
          });
        }
      }
      return { success: true, pedidoId };
    }),
    aprovarAdmin: adminProcedure2.input(z2.object({
      pedidoId: z2.number(),
      aprovado: z2.boolean(),
      observacoes: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const pedido = await getPedidoById(input.pedidoId);
      if (!pedido) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Pedido n\xE3o encontrado" });
      }
      const novoEstado = input.aprovado ? "aprovado_admin" : "rejeitado";
      await updatePedido(input.pedidoId, { estado: novoEstado });
      const aprovacao = await getAprovacaoByPedidoId(input.pedidoId);
      if (aprovacao) {
        await updateAprovacao(aprovacao.id, {
          adminId: ctx.user.id,
          estadoAdmin: input.aprovado ? "aprovado" : "rejeitado",
          observacoesAdmin: input.observacoes || null,
          dataAprovacaoAdmin: /* @__PURE__ */ new Date()
        });
      }
      const loja = await getLojaById(pedido.lojaId);
      if (input.aprovado) {
        const gestores = (await getAllUsers()).filter((u) => u.role === "gestor");
        for (const gestor of gestores) {
          if (gestor.whatsapp) {
            const message = getWhatsAppTemplate("pedido_aprovado", {
              lojaNome: loja?.nome || "Desconhecida",
              tipo: pedido.tipo,
              dataInicio: pedido.dataInicio.toLocaleDateString("pt-PT"),
              observacoes: input.observacoes,
              portalUrl: process.env.VITE_APP_URL || "https://portal-apoio-lojas.manus.space"
            });
            const sent = await sendWhatsAppMessage({
              to: gestor.whatsapp,
              message
            });
            await createNotificacao({
              userId: gestor.id,
              pedidoId: input.pedidoId,
              tipo: "pedido_aprovado",
              whatsapp: gestor.whatsapp,
              mensagem: message,
              enviada: sent,
              enviadaEm: sent ? /* @__PURE__ */ new Date() : null
            });
          }
        }
      } else {
        const lojaUser = await getUserById(pedido.criadoPor);
        if (lojaUser?.whatsapp) {
          const message = getWhatsAppTemplate("pedido_rejeitado", {
            lojaNome: loja?.nome || "Desconhecida",
            tipo: pedido.tipo,
            dataInicio: pedido.dataInicio.toLocaleDateString("pt-PT"),
            observacoes: input.observacoes,
            portalUrl: process.env.VITE_APP_URL || "https://portal-apoio-lojas.manus.space"
          });
          const sent = await sendWhatsAppMessage({
            to: lojaUser.whatsapp,
            message
          });
          await createNotificacao({
            userId: lojaUser.id,
            pedidoId: input.pedidoId,
            tipo: "pedido_rejeitado",
            whatsapp: lojaUser.whatsapp,
            mensagem: message,
            enviada: sent,
            enviadaEm: sent ? /* @__PURE__ */ new Date() : null
          });
        }
      }
      return { success: true };
    }),
    confirmarGestor: gestorProcedure.input(z2.object({
      pedidoId: z2.number(),
      confirmado: z2.boolean(),
      observacoes: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const pedido = await getPedidoById(input.pedidoId);
      if (!pedido) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Pedido n\xE3o encontrado" });
      }
      if (pedido.estado !== "aprovado_admin") {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Pedido n\xE3o est\xE1 aprovado pelo admin" });
      }
      const novoEstado = input.confirmado ? "confirmado" : "cancelado";
      await updatePedido(input.pedidoId, { estado: novoEstado });
      const aprovacao = await getAprovacaoByPedidoId(input.pedidoId);
      if (aprovacao) {
        await updateAprovacao(aprovacao.id, {
          gestorId: ctx.user.id,
          estadoGestor: input.confirmado ? "confirmado" : "cancelado",
          observacoesGestor: input.observacoes || null,
          dataAprovacaoGestor: /* @__PURE__ */ new Date()
        });
      }
      const lojaUser = await getUserById(pedido.criadoPor);
      const loja = await getLojaById(pedido.lojaId);
      if (lojaUser?.whatsapp) {
        const message = getWhatsAppTemplate(
          input.confirmado ? "pedido_confirmado" : "pedido_cancelado",
          {
            lojaNome: loja?.nome || "Desconhecida",
            tipo: pedido.tipo,
            dataInicio: pedido.dataInicio.toLocaleDateString("pt-PT"),
            observacoes: input.observacoes,
            portalUrl: process.env.VITE_APP_URL || "https://portal-apoio-lojas.manus.space"
          }
        );
        const sent = await sendWhatsAppMessage({
          to: lojaUser.whatsapp,
          message
        });
        await createNotificacao({
          userId: lojaUser.id,
          pedidoId: input.pedidoId,
          tipo: input.confirmado ? "pedido_confirmado" : "pedido_cancelado",
          whatsapp: lojaUser.whatsapp,
          mensagem: message,
          enviada: sent,
          enviadaEm: sent ? /* @__PURE__ */ new Date() : null
        });
      }
      return { success: true };
    })
  }),
  // === INDISPONIBILIDADES ===
  indisponibilidades: router({
    list: gestorProcedure.query(async ({ ctx }) => {
      return getIndisponibilidadesByGestor(ctx.user.id);
    }),
    create: gestorProcedure.input(z2.object({
      dataInicio: z2.string(),
      dataFim: z2.string(),
      motivo: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      await createIndisponibilidade({
        gestorId: ctx.user.id,
        dataInicio: new Date(input.dataInicio),
        dataFim: new Date(input.dataFim),
        motivo: input.motivo || null
      });
      return { success: true };
    }),
    delete: gestorProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deleteIndisponibilidade(input.id);
      return { success: true };
    })
  }),
  // === CALENDARIO ===
  calendario: router({
    disponibilidade: protectedProcedure.input(z2.object({
      mes: z2.number(),
      ano: z2.number()
    })).query(async ({ input }) => {
      const pedidosConfirmados = (await getAllPedidos()).filter(
        (p) => p.estado === "confirmado" && p.dataInicio.getMonth() === input.mes && p.dataInicio.getFullYear() === input.ano
      );
      const gestores = (await getAllUsers()).filter((u) => u.role === "gestor");
      const indisponibilidades2 = [];
      for (const gestor of gestores) {
        const indisp = await getIndisponibilidadesByGestor(gestor.id);
        indisponibilidades2.push(...indisp);
      }
      return {
        pedidosConfirmados,
        indisponibilidades: indisponibilidades2
      };
    })
  })
});

// server/_core/context.ts
init_sdk();
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// netlify/functions/server.ts
var app = express();
app.use(express.json());
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
app.get("/api/oauth/callback", async (req, res) => {
  const { handleOAuthCallback } = await Promise.resolve().then(() => (init_oauth(), oauth_exports));
  return handleOAuthCallback(req, res);
});
var handler = serverlessHttp(app);
export {
  handler
};
