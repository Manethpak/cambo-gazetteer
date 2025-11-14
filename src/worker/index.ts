import { Hono } from "hono";
import healthRouter from "./modules/health/health.route";
import codeRouter from "./modules/code/code.route";
import searchRouter from "./modules/search/search.route";
import administrativeRouter from "./modules/administrative/administrative.route";
import statsRouter from "./modules/stats/stats.route";
import { openAPIRouteHandler } from "hono-openapi";
import { Scalar } from "@scalar/hono-api-reference";

const app = new Hono<{ Bindings: Env }>();

app.route("/api", healthRouter);
app.route("/api", statsRouter);
app.route("/api", administrativeRouter);
app.route("/api", codeRouter);
app.route("/api", searchRouter);

app.get(
  "/openapi.json",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Hono",
        version: "1.0.0",
        description: "Camdbodia Geo Gazetteer API",
      },
    },
  })
);

app.get(
  "/api/docs",
  Scalar({
    theme: "deepSpace",
    url: "/openapi.json",
  })
);

// Serve static files (React documentation app) for all other routes
// This catches all non-API routes and serves the React app
app.get("*", async (c) => {
  // Try to serve from assets first, fallback to index.html for SPA
  const url = new URL(c.req.url);
  try {
    return (
      (await c.env?.ASSETS?.fetch(c.req.url)) ||
      new Response("Not found", { status: 404 })
    );
  } catch {
    // Fallback to index.html for SPA routing
    url.pathname = "/index.html";
    return (
      (await c.env?.ASSETS?.fetch(url.toString())) || c.text("Not found", 404)
    );
  }
});

export default app;
