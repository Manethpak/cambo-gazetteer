import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { getLocationByCode } from "./code.handler";
import { sValidator } from "@hono/standard-validator";
import { ParamSchema } from "./code.schema";

const codeRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /code/:code - Get location by code with full hierarchy context
 */
codeRouter.get(
  "/v1/code/:code",
  sValidator("param", ParamSchema),
  async (c) => {
    const code = c.req.param("code");
    const db = drizzle(c.env.cambo_gazetteer);

    const location = await getLocationByCode(db, code);

    if (!location) {
      return c.json({ error: "Location not found" }, 404);
    }

    return c.json(location);
  }
);

export default codeRouter;
