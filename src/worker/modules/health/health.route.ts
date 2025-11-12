/**
 * Health check routes
 */

import { Hono } from "hono";
import { getHealthStatus } from "./health.handler";

const healthRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /health - Check API health status
 */
healthRouter.get("/health", (c) => {
  const result = getHealthStatus();
  return c.json(result);
});

export default healthRouter;
