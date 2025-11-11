import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, or } from "drizzle-orm";
import { administrativeUnits } from "./db/schema";
import {
  getFullHierarchy,
  autocompleteSearch,
  searchWithHierarchy,
  buildBreadcrumb,
} from "./db/queries";

const app = new Hono<{ Bindings: Env }>();

// API routes - these must be defined FIRST before any static serving
app.get("/api", (c) => {
  return c.json({
    name: "Cambodia Geo Gazetteer API",
    version: "1.0.0",
    description: "Geographical Index Open API for Cambodia",
    endpoints: {
      health: "/api/health",
      search: "/api/search?q={query}",
      autocomplete: "/api/autocomplete?q={query}",
      location: "/api/location/:code",
      provinces: "/api/provinces",
      districts: "/api/districts?province={code}",
      communes: "/api/communes?district={code}",
      villages: "/api/villages?commune={code}",
    },
  });
});

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Search endpoint with fuzzy matching and hierarchy
app.get("/api/search", async (c) => {
  const query = c.req.query("q");
  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  const db = drizzle(c.env.cambo_gazetteer);
  const results = await searchWithHierarchy(db, query, 20);

  return c.json({
    query,
    count: results.length,
    results,
  });
});

// Autocomplete endpoint for typeahead
app.get("/api/autocomplete", async (c) => {
  const query = c.req.query("q");
  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  const db = drizzle(c.env.cambo_gazetteer);
  const results = await autocompleteSearch(db, query, 10);

  return c.json({
    query,
    suggestions: results,
  });
});

// Get location with full hierarchy context
app.get("/api/location/:code", async (c) => {
  const code = c.req.param("code");
  const db = drizzle(c.env.cambo_gazetteer);

  const hierarchy = await getFullHierarchy(db, code);

  if (!hierarchy.current) {
    return c.json({ error: "Location not found" }, 404);
  }

  const breadcrumb = buildBreadcrumb(hierarchy.ancestors, hierarchy.current);

  return c.json({
    ...hierarchy.current,
    breadcrumb,
    path: breadcrumb.map((b) => b.name_en).join(" > "),
    ancestors: hierarchy.ancestors,
    children: hierarchy.descendants,
    siblings: hierarchy.siblings,
    childrenCount: hierarchy.childrenCount,
  });
});

// Get all provinces
app.get("/api/provinces", async (c) => {
  const db = drizzle(c.env.cambo_gazetteer);

  const provinces = await db
    .select()
    .from(administrativeUnits)
    .where(
      or(
        eq(administrativeUnits.type, "province"),
        eq(administrativeUnits.type, "municipality")
      )
    )
    .orderBy(administrativeUnits.nameEn);

  return c.json({
    count: provinces.length,
    results: provinces,
  });
});

// Get districts by province
app.get("/api/districts", async (c) => {
  const provinceCode = c.req.query("province");
  const db = drizzle(c.env.cambo_gazetteer);

  if (provinceCode) {
    const districts = await db
      .select()
      .from(administrativeUnits)
      .where(
        and(
          eq(administrativeUnits.type, "district"),
          eq(administrativeUnits.parentCode, provinceCode)
        )
      )
      .orderBy(administrativeUnits.nameEn);

    return c.json({
      provinceCode,
      count: districts.length,
      results: districts,
    });
  }

  // Return all districts if no province specified
  const allDistricts = await db
    .select()
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "district"))
    .orderBy(administrativeUnits.nameEn)
    .limit(100);

  return c.json({
    count: allDistricts.length,
    results: allDistricts,
  });
});

// Get communes by district
app.get("/api/communes", async (c) => {
  const districtCode = c.req.query("district");
  const db = drizzle(c.env.cambo_gazetteer);

  if (districtCode) {
    const communes = await db
      .select()
      .from(administrativeUnits)
      .where(
        and(
          eq(administrativeUnits.type, "commune"),
          eq(administrativeUnits.parentCode, districtCode)
        )
      )
      .orderBy(administrativeUnits.nameEn);

    return c.json({
      districtCode,
      count: communes.length,
      results: communes,
    });
  }

  // Return sample if no district specified
  const sampleCommunes = await db
    .select()
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "commune"))
    .orderBy(administrativeUnits.nameEn)
    .limit(100);

  return c.json({
    count: sampleCommunes.length,
    results: sampleCommunes,
  });
});

// Get villages by commune
app.get("/api/villages", async (c) => {
  const communeCode = c.req.query("commune");
  const db = drizzle(c.env.cambo_gazetteer);

  if (communeCode) {
    const villages = await db
      .select()
      .from(administrativeUnits)
      .where(
        and(
          eq(administrativeUnits.type, "village"),
          eq(administrativeUnits.parentCode, communeCode)
        )
      )
      .orderBy(administrativeUnits.nameEn);

    return c.json({
      communeCode,
      count: villages.length,
      results: villages,
    });
  }

  // Return sample if no commune specified
  const sampleVillages = await db
    .select()
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "village"))
    .orderBy(administrativeUnits.nameEn)
    .limit(100);

  return c.json({
    count: sampleVillages.length,
    results: sampleVillages,
  });
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
