import { eq, count } from "drizzle-orm";
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
