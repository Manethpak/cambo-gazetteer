import z from "zod";
import {
  createResponseBuilder,
  zodSchemaToParameters,
} from "~/utils/openapi-utils";
import {
  administrativeUnitSchema,
  administrativeUnitTypeSchema,
  paginationMetaSchema,
  paginationQuerySchema,
} from "~/common/common.schema";

const tags = ["Search"];

/**
 * Query parameter schemas
 */

export const searchQuerySchema = paginationQuerySchema.extend({
  q: z.string().describe("Search query (Khmer or English)"),
});

export const autocompleteQuerySchema = z.object({
  q: z.string().describe("Autocomplete query (Khmer or English)"),
});

/**
 * Route documentation
 */

const breadcrumbItemSchema = z.object({
  code: z.string(),
  nameKm: z.string(),
  nameEn: z.string(),
  type: administrativeUnitTypeSchema,
});

const searchResultSchema = administrativeUnitSchema.extend({
  breadcrumb: z.array(breadcrumbItemSchema),
  path: z.string(),
  rank: z.number().optional(),
});

const paginatedSearchResponseSchema = z.object({
  query: z.string(),
  data: z.array(searchResultSchema),
  pagination: paginationMetaSchema,
});

const autocompleteResponseSchema = z.object({
  query: z.string(),
  suggestions: z.array(administrativeUnitSchema),
});

const errorResponseSchema = z.object({
  error: z.string(),
});

export const searchDoc = {
  tags,
  description:
    "Performs a full-text search across all administrative units (provinces, districts, communes, villages) with fuzzy matching support. Returns results with full hierarchical context (breadcrumb and path). Supports pagination via 'page' and 'limit' query parameters (defaults: page=1, limit=20).",
  parameters: zodSchemaToParameters(searchQuerySchema),
  responses: createResponseBuilder()
    .ok({
      description: "Successfully retrieved search results",
      schema: paginatedSearchResponseSchema,
    })
    .badRequest({
      description: "Missing required query parameter 'q'",
      schema: errorResponseSchema,
    })
    .build(),
};

export const autocompleteDoc = {
  tags,
  description:
    "Provides autocomplete suggestions for a given query string. Optimized for fast typeahead responses. Returns up to 10 suggestions without pagination. Useful for implementing search-as-you-type functionality.",
  parameters: zodSchemaToParameters(autocompleteQuerySchema),
  responses: createResponseBuilder()
    .ok({
      description: "Successfully retrieved autocomplete suggestions",
      schema: autocompleteResponseSchema,
    })
    .badRequest({
      description: "Missing required query parameter 'q'",
      schema: errorResponseSchema,
    })
    .build(),
};
