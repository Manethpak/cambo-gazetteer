/**
 * Search handler - Business logic for search and autocomplete endpoints
 */

import type { Database, SearchResponse, AutocompleteResponse } from "../../types";
import { autocompleteSearch, searchWithHierarchy } from "../../db/queries";

/**
 * Search with hierarchy context
 */
export async function search(
  db: Database,
  query: string,
  limit = 20
): Promise<SearchResponse> {
  const results = await searchWithHierarchy(db, query, limit);

  return {
    query,
    count: results.length,
    results,
  };
}

/**
 * Autocomplete search for typeahead
 */
export async function autocomplete(
  db: Database,
  query: string,
  limit = 10
): Promise<AutocompleteResponse> {
  const suggestions = await autocompleteSearch(db, query, limit);

  return {
    query,
    suggestions,
  };
}
