/** Run with: pnpm exec tsx --tsconfig tsconfig.worker.json scripts/verify-d1-read-cost.ts */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Hono } from "hono";
import { dbClient } from "../src/worker/db/index";
import { getVillages } from "../src/worker/modules/administrative/administrative.handler";
import { cacheKey } from "../src/worker/utils/cache";
import { rateLimit } from "../src/worker/utils/rate-limit";

// Use the same Miniflare runtime bundled with this project's Wrangler.
const require = createRequire(import.meta.url);
const { Miniflare } = require(require.resolve("miniflare", {
  paths: [require.resolve("wrangler/package.json")],
}));
const mf = new Miniflare({
  modules: true,
  script: "export default { fetch() { return new Response('ok'); } }",
  d1Databases: ["DB"],
});
try {
  const binding = await mf.getD1Database("DB");
  for (const file of ["0000_dizzy_silver_fox.sql", "0002_salty_leo.sql"]) {
    for (const statement of readFileSync(`drizzle/${file}`, "utf8").split("--> statement-breakpoint")) {
      if (statement.trim()) await binding.prepare(statement).run();
    }
  }
  await binding.prepare(`WITH RECURSIVE numbers(n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM numbers WHERE n < 14570
  ) INSERT INTO administrative_units(code, name_en, name_km, type)
    SELECT printf('%08d', n), 'Village ' || n, 'ភូមិ', 'village' FROM numbers`).run();
  const listSql = "SELECT * FROM administrative_units WHERE type = 'village' ORDER BY code LIMIT 20 OFFSET 0";
  const before = await binding.prepare(listSql).all();
  const beforePlan = await binding.prepare(`EXPLAIN QUERY PLAN ${listSql}`).all();
  assert.ok(beforePlan.results.some((row: { detail: string }) => row.detail.includes("TEMP B-TREE")));
  for (const statement of readFileSync("drizzle/0003_majestic_ozymandias.sql", "utf8").split("--> statement-breakpoint")) {
    if (statement.trim()) await binding.prepare(statement).run();
  }
  const after = await binding.prepare(listSql).all();
  assert.deepEqual(after.results, before.results);
  assert.ok(after.meta.rows_read < before.meta.rows_read / 100);
  const deepPage = await binding.prepare(listSql.replace("OFFSET 0", "OFFSET 10000")).all();
  assert.ok(deepPage.meta.rows_read > after.meta.rows_read);
  const afterPlan = await binding.prepare(`EXPLAIN QUERY PLAN ${listSql}`).all();
  assert.ok(afterPlan.results.some((row: { detail: string }) => row.detail.includes("type_code_idx")));
  assert.ok(!afterPlan.results.some((row: { detail: string }) => row.detail.includes("TEMP B-TREE")));
  const filteredPlan = await binding.prepare("EXPLAIN QUERY PLAN SELECT * FROM administrative_units WHERE type = 'village' AND parent_code = '01' ORDER BY code LIMIT 20").all();
  assert.ok(filteredPlan.results.some((row: { detail: string }) => row.detail.includes("type_parent_code_idx")));

  const stored = new Map<string, Response>();
  Object.defineProperty(globalThis, "caches", { configurable: true, value: {
    async open() { return {
      async match(key: string) { return stored.get(key)?.clone(); },
      async put(key: string, value: Response) { stored.set(key, value.clone()); },
    }; },
  } });
  const queries: string[] = [];
  const monitored = new Proxy(binding, {
    get(target, property) {
      if (property === "prepare") return (query: string) => {
        queries.push(query);
        return target.prepare(query);
      };
      return Reflect.get(target, property);
    },
  });
  const db = dbClient({ cambo_gazetteer: monitored });
  const first = await getVillages(db, 1, 20);
  const second = await getVillages(db, 2, 20);
  assert.equal(first.pagination.total, 14570);
  assert.equal(second.pagination.total, 14570);
  assert.notEqual(first.data[0].code, second.data[0].code);
  assert.equal(queries.filter((sql) => sql.includes("count(*)")).length, 1);
  const queryCount = queries.length;
  assert.equal((await getVillages(db, 1000, 20)).data.length, 0);
  assert.equal(queries.length, queryCount);
  assert.equal((await getVillages(db, 1, 20, "missing")).pagination.total, 0);
  assert.equal(queries.filter((sql) => sql.includes("count(*)")).length, 2);
  assert.equal(cacheKey("https://example.com/api/v1/stats?nonce=1", "stats"), cacheKey("https://example.com/api/v1/stats?nonce=2", "stats"));
  assert.equal(cacheKey("https://example.com/api/v1/villages?limit=20&page=2&nonce=1", "villages"), cacheKey("https://example.com/api/v1/villages?page=2&limit=20", "villages"));
  assert.notEqual(cacheKey("https://example.com/api/search?q=", "search"), cacheKey("https://example.com/api/search?q=Phnom", "search"));

  const keys: string[] = [];
  const env = { API_RATE_LIMITER: { async limit({ key }: { key: string }) {
    keys.push(key);
    return { success: keys.length === 1 };
  } } };
  const app = new Hono();
  app.use("*", rateLimit());
  app.get("*", (c) => c.json({ ok: true }));
  assert.equal((await app.request("https://example.com/api/v1/villages", {}, env)).status, 200);
  const blocked = await app.request("https://example.com/api/v1/villages", {
    headers: { origin: "https://example.com", referer: "https://example.com/", "x-forwarded-for": "spoofed" },
  }, env);
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get("Retry-After"), "60");
  assert.equal(blocked.headers.get("Cache-Control"), "no-store");
  assert.equal(keys[0], keys[1]);
  console.log(JSON.stringify({ before: before.meta, after: after.meta, deepPage: deepPage.meta, afterPlan: afterPlan.results }, null, 2));
  console.log("PASS: indexed pagination, unchanged rows, cached totals, out-of-range pages, filter isolation, cache keys, and rate-limit bypass prevention.");
} finally {
  await mf.dispose();
}
