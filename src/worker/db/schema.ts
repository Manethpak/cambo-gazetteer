import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Main table for all administrative units in Cambodia
 * Supports hierarchical structure: Province → District → Commune → Village
 */
export const administrativeUnits = sqliteTable(
  "administrative_units",
  {
    // Primary key - using the official administrative code
    code: text("code").primaryKey(),

    // Names in both Khmer and English
    nameKm: text("name_km").notNull(),
    nameEn: text("name_en").notNull(),

    // Type: province, municipality, district, commune, village
    type: text("type", {
      enum: ["province", "municipality", "district", "commune", "village"],
    }).notNull(),

    // Self-referencing foreign key for hierarchy
    parentCode: text("parent_code").references(
      (): any => administrativeUnits.code
    ),

    // Optional metadata fields from source data
    reference: text("reference"),
    officialNote: text("official_note"),
    checkerNote: text("checker_note"),

    // Timestamps
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`
    ),
  },
  (table) => ({
    // Indexes for common query patterns
    typeIdx: index("type_idx").on(table.type),
    parentCodeIdx: index("parent_code_idx").on(table.parentCode),
    // Composite index for type + parent queries (get all districts in a province)
    typeParentIdx: index("type_parent_idx").on(table.type, table.parentCode),
    // Index for name searches (before FTS5 kicks in)
    nameEnIdx: index("name_en_idx").on(table.nameEn),
    nameKmIdx: index("name_km_idx").on(table.nameKm),
  })
);

// Type exports for TypeScript
export type InsertAdministrativeUnit = typeof administrativeUnits.$inferInsert;
export type SelectAdministrativeUnit = typeof administrativeUnits.$inferSelect;
