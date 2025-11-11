import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

// API routes - these must be defined FIRST before any static serving
app.get("/api", (c) => {
  return c.json({
    name: "Cambodia Geo Gazetteer API",
    version: "1.0.0",
    description: "Geographical Index Open API for Cambodia",
    endpoints: {
      provinces: "/api/provinces",
      districts: "/api/districts",
      communes: "/api/communes",
    },
  });
});

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Add your other API endpoints here
app.get("/api/provinces", (c) => {
  // Your provinces data
  return c.json([]);
});

app.get("/api/districts", (c) => {
  // Your districts data
  return c.json([]);
});

app.get("/api/communes", (c) => {
  // Your communes data
  return c.json([]);
});

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
