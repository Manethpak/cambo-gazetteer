/**
 * Search routes - Search and autocomplete endpoints
 */

import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { search, autocomplete } from "./search.handler";

const searchRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /search - Search endpoint with fuzzy matching and hierarchy
 */
searchRouter.get("/search", async (c) => {
  const query = c.req.query("q");
  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  const db = drizzle(c.env.cambo_gazetteer);
  const result = await search(db, query, 20);

  return c.json(result);
});

/**
 * GET /autocomplete - Autocomplete endpoint for typeahead
 */
searchRouter.get("/autocomplete", async (c) => {
  const query = c.req.query("q");
  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  const db = drizzle(c.env.cambo_gazetteer);
  const result = await autocomplete(db, query, 10);

  return c.json(result);
});

export default searchRouter;
