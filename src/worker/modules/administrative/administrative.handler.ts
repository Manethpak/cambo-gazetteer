/**
 * Administrative handler - Business logic for administrative units endpoints
 */

import { eq, and, or } from "drizzle-orm";
import { administrativeUnits } from "../../db/schema";
import type { Database, ListResponse, AdministrativeUnit } from "../../types";

/**
 * Get all provinces and municipalities
 */
export async function getProvinces(
  db: Database
): Promise<ListResponse<AdministrativeUnit>> {
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

  return {
    count: provinces.length,
    results: provinces,
  };
}

/**
 * Get districts by province code (or all districts if no province specified)
 */
export async function getDistricts(
  db: Database,
  provinceCode?: string
): Promise<ListResponse<AdministrativeUnit> & { provinceCode?: string }> {
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

    return {
      provinceCode,
      count: districts.length,
      results: districts,
    };
  }

  // Return all districts if no province specified
  const allDistricts = await db
    .select()
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "district"))
    .orderBy(administrativeUnits.nameEn)
    .limit(100);

  return {
    count: allDistricts.length,
    results: allDistricts,
  };
}

/**
 * Get communes by district code (or sample communes if no district specified)
 */
export async function getCommunes(
  db: Database,
  districtCode?: string
): Promise<ListResponse<AdministrativeUnit> & { districtCode?: string }> {
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

    return {
      districtCode,
      count: communes.length,
      results: communes,
    };
  }

  // Return sample if no district specified
  const sampleCommunes = await db
    .select()
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "commune"))
    .orderBy(administrativeUnits.nameEn)
    .limit(100);

  return {
    count: sampleCommunes.length,
    results: sampleCommunes,
  };
}

/**
 * Get villages by commune code (or sample villages if no commune specified)
 */
export async function getVillages(
  db: Database,
  communeCode?: string
): Promise<ListResponse<AdministrativeUnit> & { communeCode?: string }> {
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

    return {
      communeCode,
      count: villages.length,
      results: villages,
    };
  }

  // Return sample if no commune specified
  const sampleVillages = await db
    .select()
    .from(administrativeUnits)
    .where(eq(administrativeUnits.type, "village"))
    .orderBy(administrativeUnits.nameEn)
    .limit(100);

  return {
    count: sampleVillages.length,
    results: sampleVillages,
  };
}
