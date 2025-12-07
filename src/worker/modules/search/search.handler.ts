import { calculateOffset, createPaginatedResponse } from "~/utils/pagination";
import { AutocompleteResponse, PaginatedSearchResponse } from "~/types";
import { fuzzySearchCount, searchWithHierarchy, autocompleteSearch } from "~/db/queries";
import { DrizzleD1Database } from "drizzle-orm/d1";

/**
 * Search with hierarchy context and pagination
 */
export async function search(
  db: DrizzleD1Database,
  query: string,
  page: number,
  limit: number,
): Promise<PaginatedSearchResponse> {
  const offset = calculateOffset(page, limit);

  // Get total count for pagination
  const total = await fuzzySearchCount(db, query);

  // Get paginated results
  const data = await searchWithHierarchy(db, query, limit, offset);

  return {
    query,
    ...createPaginatedResponse(data, page, limit, total),
  };
}

/**
 * Autocomplete search for typeahead
 */
export async function autocomplete(
  db: DrizzleD1Database,
  query: string,
  limit = 10,
): Promise<AutocompleteResponse> {
  const suggestions = await autocompleteSearch(db, query, limit);

  return {
    query,
    suggestions,
  };
}
