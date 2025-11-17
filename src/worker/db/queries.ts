import { sql } from "drizzle-orm";

/**
 * Get all ancestors (parent chain) for a given administrative unit
 * Returns array ordered from root (province) to immediate parent
 */
export async function getAncestors(db: any, code: string) {
  const result = await db.all(sql`
    WITH RECURSIVE ancestor_tree AS (
      -- Start with the current node
      SELECT code, name_km, name_en, type, type_km, type_en, parent_code, 0 as level
      FROM administrative_units
      WHERE code = ${code}
      
      UNION ALL
      
      -- Recursively get parents
      SELECT au.code, au.name_km, au.name_en, au.type, au.type_km, au.type_en, au.parent_code, at.level + 1
      FROM administrative_units au
      INNER JOIN ancestor_tree at ON au.code = at.parent_code
    )
    SELECT code, name_km, name_en, type, type_km, type_en, parent_code, level
    FROM ancestor_tree
    WHERE level > 0
    ORDER BY level DESC
  `);
  return result || [];
}

/**
 * Get immediate descendants (direct children only) for a given administrative unit
 * Returns array with only 1 level of children
 */
export async function getDescendants(db: any, code: string) {
  const result = await db.all(sql`
    SELECT au.code, au.name_km, au.name_en, au.type, au.type_km, au.type_en, au.parent_code
    FROM administrative_units au
    WHERE au.parent_code = ${code}
    ORDER BY au.name_en
  `);

  return result || [];
}

/**
 * Get siblings (units with same parent) for a given administrative unit
 */
export async function getSiblings(db: any, code: string, limit = 10) {
  const result = await db.all(sql`
    SELECT s.code, s.name_km, s.name_en, s.type, s.type_km, s.type_en
    FROM administrative_units current
    JOIN administrative_units s ON s.parent_code = current.parent_code
    WHERE current.code = ${code} AND s.code != ${code}
    ORDER BY s.name_en
    LIMIT ${limit}
  `);

  return result || [];
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

  return result || [];
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
    current: current?.[0],
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
      nameKm: a.name_km || a.nameKm,
      nameEn: a.name_en || a.nameEn,
      type: a.type,
      typeKm: a.type_km || a.typeKm,
      typeEn: a.type_en || a.typeEn,
    })),
    {
      code: current.code,
      nameKm: current.name_km || current.nameKm,
      nameEn: current.name_en || current.nameEn,
      type: current.type,
      typeKm: current.type_km || current.typeKm,
      typeEn: current.type_en || current.typeEn,
    },
  ];
}

/**
 * Fuzzy search using FTS5 (if FTS5 table exists)
 * Falls back to LIKE search if FTS5 is not available
 */
export async function fuzzySearch(
  db: any,
  query: string,
  limit = 20,
  offset = 0
) {
  // First, try FTS5 search
  try {
    // Sanitize query for FTS5 by escaping single quotes
    const sanitizedQuery = query.replace(/'/g, "''");

    const ftsResult = await db.all(sql`
      SELECT 
        au.code, 
        au.name_km, 
        au.name_en, 
        au.type,
        au.type_km,
        au.type_en,
        au.parent_code
      FROM administrative_units_fts fts
      JOIN administrative_units au ON au.rowid = fts.rowid
      WHERE administrative_units_fts MATCH ${sql.raw(`'${sanitizedQuery}'`)}
      ORDER BY fts.rank
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    return ftsResult || [];
  } catch {
    // Fallback to LIKE search if FTS5 table doesn't exist
    const likeResult = await db.all(sql`
      SELECT code, name_km, name_en, type, parent_code, type_km, type_en
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
      OFFSET ${offset}
    `);

    return likeResult || [];
  }
}

/**
 * Get total count for fuzzy search
 */
export async function fuzzySearchCount(db: any, query: string) {
  try {
    // Sanitize query for FTS5 by escaping single quotes
    const sanitizedQuery = query.replace(/'/g, "''");

    const ftsResult = await db.all(sql`
      SELECT COUNT(*) as count
      FROM administrative_units_fts fts
      WHERE administrative_units_fts MATCH ${sql.raw(`'${sanitizedQuery}'`)}
    `);

    return ftsResult?.[0]?.count || 0;
  } catch {
    const likeResult = await db.all(sql`
      SELECT COUNT(*) as count
      FROM administrative_units
      WHERE name_en LIKE ${"%" + query + "%"} 
         OR name_km LIKE ${"%" + query + "%"}
         OR code LIKE ${query + "%"}
    `);

    return likeResult?.[0]?.count || 0;
  }
}

/**
 * Autocomplete search (prefix matching)
 * Optimized for typeahead/autocomplete use cases
 */
export async function autocompleteSearch(db: any, query: string, limit = 10) {
  try {
    // Sanitize query for FTS5 by escaping single quotes
    const sanitizedQuery = query.replace(/'/g, "''");

    // Try FTS5 prefix search
    const ftsResult = await db.all(sql`
      SELECT 
        au.code, 
        au.name_km, 
        au.name_en, 
        au.type,
        au.parent_code,
        au.type_km,
        au.type_en
      FROM administrative_units_fts fts
      JOIN administrative_units au ON au.rowid = fts.rowid
      WHERE administrative_units_fts MATCH ${sql.raw(`'${sanitizedQuery}*'`)}
      ORDER BY rank
      LIMIT ${limit}
    `);

    return ftsResult || [];
  } catch {
    // Fallback to LIKE prefix search
    const likeResult = await db.all(sql`
      SELECT code, name_km, name_en, type, type_km, type_en, parent_code
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

    return likeResult || [];
  }
}

/**
 * Search with full hierarchy context
 * Returns search results enriched with breadcrumb trails
 */
export async function searchWithHierarchy(
  db: any,
  query: string,
  limit = 20,
  offset = 0
) {
  const searchResults = await fuzzySearch(db, query, limit, offset);

  const enriched = await Promise.all(
    searchResults.map(async (result: any) => {
      const ancestors = await getAncestors(db, result.code);
      const breadcrumb = buildBreadcrumb(ancestors, result);

      return {
        ...result,
        breadcrumb,
        path: breadcrumb.map((b) => b.nameEn).join(", "),
        pathKm: breadcrumb.map((b) => b.nameKm).join(", "),
      };
    })
  );

  return enriched;
}
