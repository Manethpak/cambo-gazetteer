import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { cache } from "hono/cache";
import { dbClient } from "~/db";
import { getStats } from "./stats.handler";
import { getStatsDoc } from "./stats.schema";

const statsRouter = new Hono<{ Bindings: Env }>();

statsRouter.get(
  "/v1/stats",
  cache({
    cacheName: "cambo-geo-stats",
    cacheControl: "public, max-age=86400, stale-while-revalidate=43200", // 24h cache, 12h stale
  }),
  describeRoute(getStatsDoc),
  async (c) => {
    const db = dbClient(c.env);
    const stats = await getStats(db);

    return c.json(stats);
  }
);

export default statsRouter;
