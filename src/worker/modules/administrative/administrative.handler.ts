import { eq, and, or, count } from "drizzle-orm";
import { administrativeUnits } from "~/db/schema";
import type { Database, AdministrativeUnit, PaginatedResponse } from "~/types";
import { createPaginatedResponse, calculateOffset } from "~/utils/pagination";

/**
 * Get all provinces and municipalities (no pagination needed - small dataset)
 */
export async function getProvinces(db: Database): Promise<PaginatedResponse<AdministrativeUnit>> {
  const provinces = await db
    .select()
    .from(administrativeUnits)
    .where(
      or(eq(administrativeUnits.type, "province"), eq(administrativeUnits.type, "municipality")),
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

/**
 * Get districts by province code (or all districts if no province specified)
 */
export async function getDistricts(
  db: Database,
  page: number,
  limit: number,
  provinceCode?: string,
): Promise<PaginatedResponse<AdministrativeUnit> & { provinceCode?: string }> {
  const offset = calculateOffset(page, limit);

  if (provinceCode) {
    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(administrativeUnits)
      .where(
        and(
          eq(administrativeUnits.type, "district"),
          eq(administrativeUnits.parentCode, provinceCode),
        ),
      );

    // Get paginated data
    const districts = await db
      .select()
      .from(administrativeUnits)
      .where(
        and(
          eq(administrativeUnits.type, "district"),
          eq(administrativeUnits.parentCode, provinceCode),
        ),
      )
      .orderBy(administrativeUnits.code)
      .limit(limit)
      .offset(offset);

    return {
      provinceCode,
      ...createPaginatedResponse(districts, page, limit, totalResult.count),
    };
  }

  // Get total count for all districts
  const [totalResult] = await db
    .select({ count: count() })
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "district"));

  // Get paginated data
  const allDistricts = await db
    .select()
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "district"))
    .orderBy(administrativeUnits.code)
    .limit(limit)
    .offset(offset);

  return createPaginatedResponse(allDistricts, page, limit, totalResult.count);
}

/**
 * Get communes by district code (or all communes if no district specified)
 */
export async function getCommunes(
  db: Database,
  page: number,
  limit: number,
  districtCode?: string,
): Promise<PaginatedResponse<AdministrativeUnit> & { districtCode?: string }> {
  const offset = calculateOffset(page, limit);

  if (districtCode) {
    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(administrativeUnits)
      .where(
        and(
          eq(administrativeUnits.type, "commune"),
          eq(administrativeUnits.parentCode, districtCode),
        ),
      );

    // Get paginated data
    const communes = await db
      .select()
      .from(administrativeUnits)
      .where(
        and(
          eq(administrativeUnits.type, "commune"),
          eq(administrativeUnits.parentCode, districtCode),
        ),
      )
      .orderBy(administrativeUnits.code)
      .limit(limit)
      .offset(offset);

    return {
      districtCode,
      ...createPaginatedResponse(communes, page, limit, totalResult.count),
    };
  }

  // Get total count for all communes
  const [totalResult] = await db
    .select({ count: count() })
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "commune"));

  // Get paginated data
  const allCommunes = await db
    .select()
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "commune"))
    .orderBy(administrativeUnits.code)
    .limit(limit)
    .offset(offset);

  return createPaginatedResponse(allCommunes, page, limit, totalResult.count);
}

/**
 * Get villages by commune code (or all villages if no commune specified)
 */
export async function getVillages(
  db: Database,
  page: number,
  limit: number,
  communeCode?: string,
): Promise<PaginatedResponse<AdministrativeUnit> & { communeCode?: string }> {
  const offset = calculateOffset(page, limit);

  if (communeCode) {
    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(administrativeUnits)
      .where(
        and(
          eq(administrativeUnits.type, "village"),
          eq(administrativeUnits.parentCode, communeCode),
        ),
      );

    // Get paginated data
    const villages = await db
      .select()
      .from(administrativeUnits)
      .where(
        and(
          eq(administrativeUnits.type, "village"),
          eq(administrativeUnits.parentCode, communeCode),
        ),
      )
      .orderBy(administrativeUnits.code)
      .limit(limit)
      .offset(offset);

    return {
      communeCode,
      ...createPaginatedResponse(villages, page, limit, totalResult.count),
    };
  }

  // Get total count for all villages
  const [totalResult] = await db
    .select({ count: count() })
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "village"));

  // Get paginated data
  const allVillages = await db
    .select()
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "village"))
    .orderBy(administrativeUnits.code)
    .limit(limit)
    .offset(offset);

  return createPaginatedResponse(allVillages, page, limit, totalResult.count);
}
