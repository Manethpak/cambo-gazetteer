import { eq, and, or, count } from "drizzle-orm";
import { administrativeUnits } from "~/db/schema";
import type { Database, AdministrativeUnit, PaginatedResponse } from "~/types";
import { createPaginatedResponse, calculateOffset } from "~/utils/pagination";

/**
 * Get all provinces and municipalities (no pagination needed - small dataset)
 */
export async function getProvinces(
  db: Database,
): Promise<PaginatedResponse<AdministrativeUnit>> {
  const provinces = await db
    .select()
    .from(administrativeUnits)
    .where(
      or(
        eq(administrativeUnits.type, "province"),
        eq(administrativeUnits.type, "municipality"),
      ),
    )
    .orderBy(administrativeUnits.code);

  // Return all provinces without pagination since it's a small dataset
  return {
    data: provinces,
    pagination: {
      page: 1,
      limit: provinces.length,
      total: provinces.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

/** Reuse totals across pages. Dataset refreshes must purge/bump this cache. */
export async function getUnitCount(
  db: Database,
  type: "district" | "commune" | "village",
  parentCode?: string,
): Promise<number> {
  const key = new URL(`https://cambo-gazetteer.internal/counts/${type}`);
  if (parentCode) key.searchParams.set("parent", parentCode);
  let countCache: Cache | undefined;
  try {
    if (typeof caches !== "undefined") {
      countCache = await caches.open("administrative-counts-v1");
      const cached = await countCache.match(key.toString());
      if (cached) return await cached.json<number>();
    }
  } catch (error) {
    console.error("Count cache read failed", error);
  }

  const [result] = await db.select({ count: count() })
    .from(administrativeUnits)
    .where(and(
      eq(administrativeUnits.type, type),
      parentCode ? eq(administrativeUnits.parentCode, parentCode) : undefined,
    ));
  if (countCache) {
    try {
      await countCache.put(key.toString(), Response.json(result.count, {
        headers: { "Cache-Control": "public, max-age=14400" },
      }));
    } catch (error) {
      console.error("Count cache write failed", error);
    }
  }
  return result.count;
}

async function getUnits(
  db: Database,
  type: "district" | "commune" | "village",
  page: number,
  limit: number,
  parentCode?: string,
): Promise<PaginatedResponse<AdministrativeUnit>> {
  const total = await getUnitCount(db, type, parentCode);
  const offset = calculateOffset(page, limit);
  // Avoid scanning the index for pages known to be outside the result set.
  const data = offset >= total ? [] : await db.select()
    .from(administrativeUnits)
    .where(and(
      eq(administrativeUnits.type, type),
      parentCode ? eq(administrativeUnits.parentCode, parentCode) : undefined,
    ))
    .orderBy(administrativeUnits.code)
    .limit(limit)
    .offset(offset);
  return createPaginatedResponse(data, page, limit, total);
}

/** Get districts, optionally scoped to a province. */
export async function getDistricts(
  db: Database, page: number, limit: number, provinceCode?: string,
): Promise<PaginatedResponse<AdministrativeUnit> & { provinceCode?: string }> {
  const result = await getUnits(db, "district", page, limit, provinceCode);
  return provinceCode ? { provinceCode, ...result } : result;
}

/** Get communes, optionally scoped to a district. */
export async function getCommunes(
  db: Database, page: number, limit: number, districtCode?: string,
): Promise<PaginatedResponse<AdministrativeUnit> & { districtCode?: string }> {
  const result = await getUnits(db, "commune", page, limit, districtCode);
  return districtCode ? { districtCode, ...result } : result;
}

/** Get villages, optionally scoped to a commune. */
export async function getVillages(
  db: Database, page: number, limit: number, communeCode?: string,
): Promise<PaginatedResponse<AdministrativeUnit> & { communeCode?: string }> {
  const result = await getUnits(db, "village", page, limit, communeCode);
  return communeCode ? { communeCode, ...result } : result;
}
