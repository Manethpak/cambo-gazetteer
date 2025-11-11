import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/worker/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  // No dbCredentials needed - we'll use Wrangler CLI for migrations
});
