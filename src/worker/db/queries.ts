/**
 * Database query helper functions for Cambodia Gazetteer
 * Provides reusable functions for hierarchical queries
 */

import { sql } from "drizzle-orm";

/**
 * Get all ancestors (parent chain) for a given administrative unit
 * Returns array ordered from root (province) to immediate parent
 */
export async function getAncestors(db: any, code: string) {
  const result = await db.all(sql`
    WITH RECURSIVE ancestor_tree AS (
      -- Start with the current node
      SELECT code, name_km, name_en, type, parent_code, 0 as level
      FROM administrative_units
      WHERE code = ${code}
      
      UNION ALL
      
      -- Recursively get parents
      SELECT au.code, au.name_km, au.name_en, au.type, au.parent_code, at.level + 1
      FROM administrative_units au
      INNER JOIN ancestor_tree at ON au.code = at.parent_code
    )
    SELECT code, name_km, name_en, type, parent_code, level
    FROM ancestor_tree
    WHERE level > 0
    ORDER BY level DESC
  `);

  return result.results || [];
}

/**
 * Get all descendants (children) for a given administrative unit
 * Returns array in hierarchical order
 *
 * @param maxDepth - Maximum depth to traverse (default: 2)
 */
export async function getDescendants(db: any, code: string, maxDepth = 2) {
  const result = await db.all(sql`
    WITH RECURSIVE descendant_tree AS (
      -- Start with the current node
      SELECT code, name_km, name_en, type, parent_code, 0 as level
      FROM administrative_units
      WHERE code = ${code}
      
      UNION ALL
      
      -- Recursively get children
      SELECT au.code, au.name_km, au.name_en, au.type, au.parent_code, dt.level + 1
      FROM administrative_units au
      INNER JOIN descendant_tree dt ON au.parent_code = dt.code
      WHERE dt.level < ${maxDepth}
    )
    SELECT code, name_km, name_en, type, parent_code, level
    FROM descendant_tree
    WHERE level > 0
    ORDER BY level, code
  `);

  return result.results || [];
}

/**
 * Get siblings (units with same parent) for a given administrative unit
 */
export async function getSiblings(db: any, code: string, limit = 10) {
  const result = await db.all(sql`
    SELECT s.code, s.name_km, s.name_en, s.type
    FROM administrative_units current
    JOIN administrative_units s ON s.parent_code = current.parent_code
    WHERE current.code = ${code} AND s.code != ${code}
    ORDER BY s.name_en
    LIMIT ${limit}
  `);

  return result.results || [];
}

/**
 * Get immediate children count grouped by type
 */
export async function getChildrenCount(db: any, code: string) {
  const result = await db.all(sql`
    SELECT COUNT(*) as count, type
    FROM administrative_units
    WHERE parent_code = ${code}
    GROUP BY type
  `);

  return result.results || [];
}

/**
 * Get full hierarchy context for a single administrative unit
 * Includes ancestors, descendants, siblings, and the current unit
 */
export async function getFullHierarchy(db: any, code: string) {
  const [ancestors, descendants, siblings, current, childrenCount] =
    await Promise.all([
      getAncestors(db, code),
      getDescendants(db, code),
      getSiblings(db, code),
      db.all(sql`SELECT * FROM administrative_units WHERE code = ${code}`),
      getChildrenCount(db, code),
    ]);

  return {
    current: current.results?.[0],
    ancestors,
    descendants,
    siblings,
    childrenCount,
  };
}

/**
 * Build breadcrumb trail from ancestors and current unit
 * Returns array from root to current
 */
export function buildBreadcrumb(ancestors: any[], current: any) {
  if (!current) return [];

  return [
    ...ancestors.map((a) => ({
      code: a.code,
      name_km: a.name_km,
      name_en: a.name_en,
      type: a.type,
    })),
    {
      code: current.code,
      name_km: current.name_km,
      name_en: current.name_en,
      type: current.type,
    },
  ];
}

/**
 * Fuzzy search using FTS5 (if FTS5 table exists)
 * Falls back to LIKE search if FTS5 is not available
 */
export async function fuzzySearch(db: any, query: string, limit = 20) {
  // First, try FTS5 search
  try {
    const ftsResult = await db.all(sql`
      SELECT 
        au.code, 
        au.name_km, 
        au.name_en, 
        au.type,
        au.parent_code,
        fts.rank
      FROM administrative_units_fts fts
      JOIN administrative_units au ON au.rowid = fts.rowid
      WHERE administrative_units_fts MATCH ${query}
      ORDER BY rank
      LIMIT ${limit}
    `);

    return ftsResult.results || [];
  } catch (error) {
    // Fallback to LIKE search if FTS5 table doesn't exist
    const likeResult = await db.all(sql`
      SELECT code, name_km, name_en, type, parent_code
      FROM administrative_units
      WHERE name_en LIKE ${"%" + query + "%"} 
         OR name_km LIKE ${"%" + query + "%"}
         OR code LIKE ${query + "%"}
      ORDER BY 
        CASE 
          WHEN code = ${query} THEN 0
          WHEN code LIKE ${query + "%"} THEN 1
          WHEN name_en LIKE ${query + "%"} THEN 2
          WHEN name_km LIKE ${query + "%"} THEN 3
          ELSE 4
        END,
        name_en
      LIMIT ${limit}
    `);

    return likeResult.results || [];
  }
}

/**
 * Autocomplete search (prefix matching)
 * Optimized for typeahead/autocomplete use cases
 */
export async function autocompleteSearch(db: any, query: string, limit = 10) {
  try {
    // Try FTS5 prefix search
    const ftsResult = await db.all(sql`
      SELECT 
        au.code, 
        au.name_km, 
        au.name_en, 
        au.type,
        au.parent_code
      FROM administrative_units_fts fts
      JOIN administrative_units au ON au.rowid = fts.rowid
      WHERE administrative_units_fts MATCH ${query + "*"}
      ORDER BY rank
      LIMIT ${limit}
    `);

    return ftsResult.results || [];
  } catch (error) {
    // Fallback to LIKE prefix search
    const likeResult = await db.all(sql`
      SELECT code, name_km, name_en, type, parent_code
      FROM administrative_units
      WHERE name_en LIKE ${query + "%"} 
         OR name_km LIKE ${query + "%"}
         OR code LIKE ${query + "%"}
      ORDER BY 
        CASE 
          WHEN name_en LIKE ${query + "%"} THEN 1
          WHEN name_km LIKE ${query + "%"} THEN 2
          ELSE 3
        END,
        length(name_en)
      LIMIT ${limit}
    `);

    return likeResult.results || [];
  }
}

/**
 * Search with full hierarchy context
 * Returns search results enriched with breadcrumb trails
 */
export async function searchWithHierarchy(db: any, query: string, limit = 20) {
  const searchResults = await fuzzySearch(db, query, limit);

  const enriched = await Promise.all(
    searchResults.map(async (result: any) => {
      const ancestors = await getAncestors(db, result.code);
      const breadcrumb = buildBreadcrumb(ancestors, result);

      return {
        ...result,
        breadcrumb,
        path: breadcrumb.map((b) => b.name_en).join(" > "),
      };
    })
  );

  return enriched;
}
