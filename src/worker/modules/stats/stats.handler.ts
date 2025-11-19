import { eq, count, sql } from "drizzle-orm";
import { administrativeUnits } from "~/db/schema";
import type { Database, StatsResponse } from "~/types";

/**
 * Get comprehensive statistics about administrative units
 * Returns counts for each type and total count
 */
export async function getStats(db: Database): Promise<StatsResponse> {
  // Execute individual queries for accurate counts
  // Using Promise.all for parallel execution to improve performance
  const [
    totalResult,
    provincesResult,
    municipalitiesResult,
    districtsResult,
    communesResult,
    villagesResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(administrativeUnits),
    db
      .select({ count: count() })
      .from(administrativeUnits)
      .where(eq(administrativeUnits.type, "province")),
    db
      .select({ count: count() })
      .from(administrativeUnits)
      .where(eq(administrativeUnits.type, "municipality")),
    db
      .select({ count: count() })
      .from(administrativeUnits)
      .where(eq(administrativeUnits.type, "district")),
    db
      .select({ count: count() })
      .from(administrativeUnits)
      .where(eq(administrativeUnits.type, "commune")),
    db
      .select({ count: count() })
      .from(administrativeUnits)
      .where(eq(administrativeUnits.type, "village")),
  ]);

  return {
    total: totalResult[0].count,
    byType: {
      provinces: provincesResult[0].count,
      municipalities: municipalitiesResult[0].count,
      districts: districtsResult[0].count,
      communes: communesResult[0].count,
      villages: villagesResult[0].count,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function getStatsDetail(db: Database) {
  // Get total count
  const totalResult = await db
    .select({ count: count() })
    .from(administrativeUnits);

  // Get list of provinces/municipalities with their descendant counts using recursive CTE
  // This counts ALL districts, communes, and villages under each province/municipality,
  // broken down by their subtypes (Khan/Srok/Krong for districts, Sangkat/Khum for communes)
  const provincesResult = await db.all(sql`
    WITH RECURSIVE descendant_tree AS (
      -- Start with all provinces and municipalities
      SELECT 
        code,
        name_en,
        name_km,
        type,
        type_en,
        type_km,
        code as root_code
      FROM administrative_units
      WHERE type IN ('province', 'municipality')
      
      UNION ALL
      
      -- Recursively get all descendants
      SELECT 
        au.code,
        au.name_en,
        au.name_km,
        au.type,
        au.type_en,
        au.type_km,
        dt.root_code
      FROM administrative_units au
      INNER JOIN descendant_tree dt ON au.parent_code = dt.code
    )
    SELECT 
      p.code,
      p.name_en as name,
      p.name_km as name_km,
      p.type,
      p.type_en,
      p.type_km,
      -- District counts by subtype
      COUNT(CASE WHEN dt.type = 'district' AND dt.type_en = 'Khan' THEN 1 END) as district_khan,
      COUNT(CASE WHEN dt.type = 'district' AND dt.type_en = 'Srok' THEN 1 END) as district_srok,
      COUNT(CASE WHEN dt.type = 'district' AND dt.type_en = 'Krong' THEN 1 END) as district_krong,
      COUNT(CASE WHEN dt.type = 'district' THEN 1 END) as district_total,
      -- Commune counts by subtype
      COUNT(CASE WHEN dt.type = 'commune' AND dt.type_en = 'Sangkat' THEN 1 END) as commune_sangkat,
      COUNT(CASE WHEN dt.type = 'commune' AND dt.type_en = 'Khum' THEN 1 END) as commune_khum,
      COUNT(CASE WHEN dt.type = 'commune' THEN 1 END) as commune_total,
      -- Village count (no subtypes)
      COUNT(CASE WHEN dt.type = 'village' THEN 1 END) as villages
    FROM administrative_units p
    LEFT JOIN descendant_tree dt ON dt.root_code = p.code AND dt.code != p.code
    WHERE p.type IN ('province', 'municipality')
    GROUP BY p.code, p.name_en, p.name_km, p.type, p.type_en, p.type_km
    ORDER BY p.type, p.name_en
  `);

  return {
    total: totalResult[0].count,
    provinces: provincesResult.map((prov: any) => ({
      code: prov.code,
      name: prov.name,
      name_km: prov.name_km,
      type: prov.type,
      type_en: prov.type_en,
      type_km: prov.type_km,
      district: {
        Khan: prov.district_khan,
        Srok: prov.district_srok,
        Krong: prov.district_krong,
        total: prov.district_total,
      },
      commune: {
        Sangkat: prov.commune_sangkat,
        Khum: prov.commune_khum,
        total: prov.commune_total,
      },
      village: {
        Phum: prov.villages,
        total: prov.villages,
      },
    })),
    timestamp: new Date().toISOString(),
  };
}
