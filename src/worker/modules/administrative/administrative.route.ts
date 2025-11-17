import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import {
  getProvinces,
  getDistricts,
  getCommunes,
  getVillages,
} from "./administrative.handler";
import { parsePaginationParams } from "~/utils/pagination";
import { dbClient } from "~/db";
import {
  getProvincesDoc,
  getDistrictsDoc,
  getCommunesDoc,
  getVillagesDoc,
  districtsQuerySchema,
  communesQuerySchema,
  villagesQuerySchema,
} from "./administrative.schema";
import { sValidator } from "@hono/standard-validator";
import { addCache } from "~/utils/cache";

const administrativeRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /provinces - Get all provinces and municipalities
 */
administrativeRouter.get(
  "/v1/provinces",
  addCache("provinces", "4hr"),
  describeRoute(getProvincesDoc),
  async (c) => {
    const db = dbClient(c.env);
    const result = await getProvinces(db);
    return c.json(result);
  }
);

/**
 * GET /districts - Get districts by province or all districts
 * Supports pagination via ?page=N&limit=N (defaults: page=1, limit=20)
 */
administrativeRouter.get(
  "/v1/districts",
  addCache("districts", "4hr"),
  describeRoute(getDistrictsDoc),
  sValidator("query", districtsQuerySchema),
  async (c) => {
    const provinceCode = c.req.query("province");
    const { page, limit } = parsePaginationParams(
      c.req.query("page"),
      c.req.query("limit")
    );
    const db = dbClient(c.env);

    const result = await getDistricts(db, page, limit, provinceCode);
    return c.json(result);
  }
);

/**
 * GET /communes - Get communes by district or all communes
 * Supports pagination via ?page=N&limit=N (defaults: page=1, limit=20)
 */
administrativeRouter.get(
  "/v1/communes",
  addCache("communes", "4hr"),
  describeRoute(getCommunesDoc),
  sValidator("query", communesQuerySchema),
  async (c) => {
    const districtCode = c.req.query("district");
    const { page, limit } = parsePaginationParams(
      c.req.query("page"),
      c.req.query("limit")
    );
    const db = dbClient(c.env);

    const result = await getCommunes(db, page, limit, districtCode);
    return c.json(result);
  }
);

/**
 * GET /villages - Get villages by commune or all villages
 * Supports pagination via ?page=N&limit=N (defaults: page=1, limit=20)
 */
administrativeRouter.get(
  "/v1/villages",
  addCache("villages", "4hr"),
  describeRoute(getVillagesDoc),
  sValidator("query", villagesQuerySchema),
  async (c) => {
    const communeCode = c.req.query("commune");
    const { page, limit } = parsePaginationParams(
      c.req.query("page"),
      c.req.query("limit")
    );
    const db = dbClient(c.env);

    const result = await getVillages(db, page, limit, communeCode);
    return c.json(result);
  }
);

export default administrativeRouter;
