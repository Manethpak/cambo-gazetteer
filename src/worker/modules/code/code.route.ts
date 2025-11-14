import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { getLocationByCode } from "./code.handler";
import { sValidator } from "@hono/standard-validator";
import { codeParamSchema, getLocationByCodeDoc } from "./code.schema";
import { dbClient } from "~/db";

const codeRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /code/:code - Get location by code with full hierarchy context
 */
codeRouter.get(
  "/v1/code/:code",
  describeRoute(getLocationByCodeDoc),
  sValidator("param", codeParamSchema),
  async (c) => {
    const code = c.req.param("code");
    const db = dbClient(c.env);

    const location = await getLocationByCode(db, code);

    if (!location) {
      return c.json({ error: "Location not found" }, 404);
    }

    return c.json(location);
  }
);

export default codeRouter;
