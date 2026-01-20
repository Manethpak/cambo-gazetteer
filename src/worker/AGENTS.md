# Worker API Code Style Guidelines

Code style guidelines for AI agents working on the Cloudflare Worker API backend.

## Module Structure

Each API feature follows a three-file pattern:
```
modules/feature-name/
├── feature-name.route.ts    # Hono router with endpoints
├── feature-name.handler.ts  # Business logic and database operations
└── feature-name.schema.ts   # Zod schemas + OpenAPI documentation
```

## Import Style

**Path Alias:** Use `~/*` for `./src/worker/*`

**Import Order:**
1. External libraries (Hono, Drizzle, etc.)
2. Internal modules (handlers, schemas)
3. Database/utilities (`~/db`, `~/utils`)
4. Types

**Example:**
```typescript
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { sValidator } from "@hono/standard-validator";
import { getProvinces } from "./administrative.handler";
import { dbClient } from "~/db";
import { parsePaginationParams } from "~/utils/pagination";
import { addCache } from "~/utils/cache";
import { getProvincesDoc, querySchema } from "./administrative.schema";
```

## Route File Pattern (`*.route.ts`)

Define HTTP endpoints and wire up middleware:

```typescript
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { sValidator } from "@hono/standard-validator";
import { addCache } from "~/utils/cache";
import { dbClient } from "~/db";

const router = new Hono<{ Bindings: Env }>();

/**
 * GET /v1/endpoint - Brief description
 */
router.get(
  "/v1/endpoint",
  addCache("cache-key", "4hr"),
  describeRoute(routeDoc),
  sValidator("query", querySchema),
  async (c) => {
    const db = dbClient(c.env);
    const { page, limit } = parsePaginationParams(
      c.req.query("page"),
      c.req.query("limit")
    );
    const result = await handler(db, page, limit);
    return c.json(result);
  }
);

export default router;
```

**Key Points:**
- Use JSDoc comments above each route
- Middleware order: cache → describeRoute → validator
- Keep handlers thin (delegate to handler functions)
- Always use `dbClient(c.env)` for database access

## Handler File Pattern (`*.handler.ts`)

Business logic and database operations:

```typescript
import { eq, and } from "drizzle-orm";
import { administrativeUnits } from "~/db/schema";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { paginate, type PaginatedResponse } from "~/utils/pagination";

export async function getItems(
  db: DrizzleD1Database,
  page: number,
  limit: number,
  filter?: string
): Promise<PaginatedResponse<Item>> {
  const conditions = [];
  
  if (filter) {
    conditions.push(eq(administrativeUnits.parentCode, filter));
  }

  return await paginate(
    db.select().from(administrativeUnits),
    { page, limit },
    conditions.length > 0 ? and(...conditions) : undefined
  );
}
```

**Key Points:**
- Export named functions (no default exports)
- Always specify explicit return types
- Use Drizzle ORM methods (avoid raw SQL)
- Build conditions dynamically for filters

## Schema File Pattern (`*.schema.ts`)

Zod schemas for validation and OpenAPI documentation:

```typescript
import z from "zod";
import { createResponseBuilder, zodSchemaToParameters } from "~/utils/openapi-utils";
import { paginatedResponseSchema, paginationQuerySchema } from "~/common/common.schema";
import type { DescribeRouteOptions } from "hono-openapi";

const tags = ["FeatureName"];

export const itemsQuerySchema = paginationQuerySchema.extend({
  filter: z.string().optional().describe("Filter by code"),
});

export const getItemsDoc: DescribeRouteOptions = {
  tags,
  description: "Returns a paginated list of items.",
  parameters: zodSchemaToParameters(itemsQuerySchema),
  responses: createResponseBuilder()
    .ok({
      description: "Successfully retrieved items",
      schema: paginatedResponseSchema,
    })
    .build(),
};
```

**Key Points:**
- Extend common schemas (pagination, responses)
- Add `.describe()` for OpenAPI documentation
- Group related schemas and docs together

## Database Guidelines

**Schema Definitions:**
```typescript
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const tableName = sqliteTable(
  "table_name",  // snake_case
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    parentCode: text("parent_code"),
  },
  (table) => ({
    nameIdx: index("name_idx").on(table.name),
  })
);

export type InsertTableName = typeof tableName.$inferInsert;
export type SelectTableName = typeof tableName.$inferSelect;
```

**Query Patterns:**
```typescript
// Prefer Drizzle methods
const results = await db
  .select()
  .from(administrativeUnits)
  .where(eq(administrativeUnits.type, "province"))
  .orderBy(desc(administrativeUnits.name_en));
```

## TypeScript

**Always specify types:**
```typescript
export async function getProvince(
  db: DrizzleD1Database,
  code: string
): Promise<SelectAdministrativeUnit | null> {
  const result = await db
    .select()
    .from(administrativeUnits)
    .where(eq(administrativeUnits.code, code))
    .limit(1);
    
  return result[0] || null;
}
```

**Zod for validation:**
```typescript
export const itemSchema = z.object({
  code: z.string(),
  type: z.enum(["province", "district", "commune", "village"]),
});

export type Item = z.infer<typeof itemSchema>;
```

## Error Handling

```typescript
// Success
return c.json({ data: results });

// Client errors
return c.json({ error: "Invalid parameters" }, 400);
return c.json({ error: "Resource not found" }, 404);

// Server errors
try {
  const result = await riskyOperation();
  return c.json(result);
} catch (error) {
  console.error("Operation failed:", error);
  return c.json({ error: "Internal server error" }, 500);
}

// Validation (automatic with sValidator)
router.post(
  "/v1/endpoint",
  sValidator("json", inputSchema),  // Returns 400 on validation error
  async (c) => {
    const validated = c.req.valid("json");
    // Use validated data
  }
);
```

## Naming Conventions

**Files:**
- Routes: `feature.route.ts`
- Handlers: `feature.handler.ts`
- Schemas: `feature.schema.ts`
- Utils: `kebab-case.ts`

**Code:**
- Functions/variables: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_CASE`
- Database tables/columns: `snake_case`

**API Routes:**
- Version prefix: `/v1/endpoint`
- Plural nouns: `/v1/provinces`
- Kebab-case: `/v1/search-autocomplete`

## Common Utilities

**Pagination:**
```typescript
const { page, limit } = parsePaginationParams(c.req.query("page"), c.req.query("limit"));
const result = await paginate(query, { page, limit }, whereCondition);
```

**Caching:**
```typescript
router.get("/v1/endpoint", addCache("key", "4hr"), ...);
```

**OpenAPI:**
```typescript
parameters: zodSchemaToParameters(querySchema)
responses: createResponseBuilder().ok({ schema }).build()
```
