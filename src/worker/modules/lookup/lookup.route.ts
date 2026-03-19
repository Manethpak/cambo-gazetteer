import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { sValidator } from "@hono/standard-validator";
import { lookupByCoordinate } from "./lookup.handler";
import { dbClient } from "~/db";
import { addCache } from "~/utils/cache";
import { rateLimit } from "~/utils/rate-limit";
import { getLookupDoc, lookupQuerySchema } from "./lookup.schema";

const lookupRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /v1/lookup - Reverse geocode a coordinate to administrative hierarchy
 */
lookupRouter.get(
  "/v1/lookup",
  addCache("lookup", "5min"),
  rateLimit({ windowMs: 60_000, maxRequests: 20 }),
  describeRoute(getLookupDoc),
  sValidator("query", lookupQuerySchema),
  async (c) => {
    const lat = parseFloat(c.req.query("lat") ?? "");
    const lng = parseFloat(c.req.query("lng") ?? "");

    if (isNaN(lat) || isNaN(lng)) {
      return c.json({ error: "Invalid lat/lng parameters" }, 400);
    }

    try {
      const db = dbClient(c.env);
      const result = await lookupByCoordinate(c.env, db, lat, lng);

      if (!result) {
        return c.json(
          {
            error:
              "Coordinate does not fall within any known Cambodian administrative boundary",
          },
          404,
        );
      }

      return c.json(result);
    } catch (error) {
      console.error("Lookup failed:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

export default lookupRouter;
