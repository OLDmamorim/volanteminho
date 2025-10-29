import type { Handler } from "@netlify/functions";
import express from "express";
import serverlessHttp from "serverless-http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();

app.use(express.json());

// tRPC endpoint
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// OAuth callback
app.get("/api/oauth/callback", async (req, res) => {
  // Import OAuth handler
  const { handleOAuthCallback } = await import("../../server/_core/oauth");
  return handleOAuthCallback(req, res);
});

const handler: Handler = serverlessHttp(app);

export { handler };
