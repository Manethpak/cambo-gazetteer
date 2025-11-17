import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { dbClient } from "~/db";
import { getStats, getStatsDetail } from "./stats.handler";
import { getDetailStatsDoc, getStatsDoc } from "./stats.schema";
import { addCache } from "~/utils/cache";

const statsRouter = new Hono<{ Bindings: Env }>();

statsRouter.get(
  "/v1/stats",
  addCache("stats", "12hr"),
  describeRoute(getStatsDoc),
  async (c) => {
    const db = dbClient(c.env);
    const stats = await getStats(db);

    return c.json(stats);
  }
);

statsRouter.get(
  "/v1/stats/detail",
  addCache("stats-detail", "12hr"),
  describeRoute(getDetailStatsDoc),
  async (c) => {
    const db = dbClient(c.env);
    const stats = await getStatsDetail(db);

    return c.json(stats);
  }
);

export default statsRouter;
