/**
 * Administrative routes - Provinces, districts, communes, villages endpoints
 */

import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import {
  getProvinces,
  getDistricts,
  getCommunes,
  getVillages,
} from "./administrative.handler";

const administrativeRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /provinces - Get all provinces and municipalities
 */
administrativeRouter.get("/provinces", async (c) => {
  const db = drizzle(c.env.cambo_gazetteer);
  const result = await getProvinces(db);
  return c.json(result);
});

/**
 * GET /districts - Get districts by province or all districts
 */
administrativeRouter.get("/districts", async (c) => {
  const provinceCode = c.req.query("province");
  const db = drizzle(c.env.cambo_gazetteer);
  const result = await getDistricts(db, provinceCode);
  return c.json(result);
});

/**
 * GET /communes - Get communes by district or sample communes
 */
administrativeRouter.get("/communes", async (c) => {
  const districtCode = c.req.query("district");
  const db = drizzle(c.env.cambo_gazetteer);
  const result = await getCommunes(db, districtCode);
  return c.json(result);
});

/**
 * GET /villages - Get villages by commune or sample villages
 */
administrativeRouter.get("/villages", async (c) => {
  const communeCode = c.req.query("commune");
  const db = drizzle(c.env.cambo_gazetteer);
  const result = await getVillages(db, communeCode);
  return c.json(result);
});

export default administrativeRouter;
