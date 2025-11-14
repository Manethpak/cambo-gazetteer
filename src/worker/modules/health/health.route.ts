import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { dbClient } from "~/db";
import { sql } from "drizzle-orm";
import { createResponseBuilder } from "~/utils/openapi-utils";
import z from "zod";

const healthRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /health - Check API health status
 */
healthRouter.get(
  "/health",
  describeRoute({
    tags: ["Health"],
    description: "Returns the current health status of the API.",
    responses: createResponseBuilder()
      .ok({
        description: "API is healthy",
        schema: z.object({
          server: z.object({
            status: z.enum(["up", "down"]),
          }),
          database: z.object({
            status: z.enum(["up", "down"]),
          }),
          timestamp: z.string().datetime(),
        }),
      })
      .build(),
  }),
  async (c) => {
    const db = dbClient(c.env);

    return c.json({
      server: {
        status: "up",
      },
      database: {
        status: (await db.run(sql`SELECT 1`)).success ? "up" : "down",
      },
      timestamp: new Date().toISOString(),
    });
  }
);

export default healthRouter;
