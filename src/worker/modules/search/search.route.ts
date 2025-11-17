import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { search, autocomplete } from "./search.handler";
import { parsePaginationParams } from "~/utils/pagination";
import { dbClient } from "~/db";
import {
  searchDoc,
  autocompleteDoc,
  searchQuerySchema,
  autocompleteQuerySchema,
} from "./search.schema";
import { sValidator } from "@hono/standard-validator";
import { addSearchCache } from "~/utils/cache";

const searchRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /search - Search endpoint with fuzzy matching and hierarchy
 * Supports pagination via ?page=N&limit=N (defaults: page=1, limit=20)
 */
searchRouter.get(
  "/search",
  addSearchCache("search"),
  sValidator("query", searchQuerySchema),
  describeRoute(searchDoc),
  async (c) => {
    const query = c.req.query("q");
    if (!query) {
      return c.json({ error: "Query parameter 'q' is required" }, 400);
    }

    const db = dbClient(c.env);
    const { page, limit } = parsePaginationParams(
      c.req.query("page"),
      c.req.query("limit")
    );
    const result = await search(db, query, page, limit);

    return c.json(result);
  }
);

/**
 * GET /autocomplete - Autocomplete endpoint for typeahead
 */
searchRouter.get(
  "/autocomplete",
  addSearchCache("autocomplete"),
  sValidator("query", autocompleteQuerySchema),
  describeRoute(autocompleteDoc),
  async (c) => {
    const query = c.req.query("q");
    if (!query) {
      return c.json({ error: "Query parameter 'q' is required" }, 400);
    }

    const db = dbClient(c.env);
    const result = await autocomplete(db, query, 10);

    return c.json(result);
  }
);

export default searchRouter;
