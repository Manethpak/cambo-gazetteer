/**
 * Pagination utilities for API endpoints
 * Provides consistent pagination across all endpoints
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Default pagination configuration
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Parse and validate pagination parameters from query strings
 */
export function parsePaginationParams(
  pageStr?: string,
  limitStr?: string
): PaginationParams {
  let page = parseInt(pageStr || String(PAGINATION_DEFAULTS.PAGE), 10);
  let limit = parseInt(limitStr || String(PAGINATION_DEFAULTS.LIMIT), 10);

  // Validate and constrain page
  if (isNaN(page) || page < 1) {
    page = PAGINATION_DEFAULTS.PAGE;
  }

  // Validate and constrain limit
  if (isNaN(limit) || limit < 1) {
    limit = PAGINATION_DEFAULTS.LIMIT;
  } else if (limit > PAGINATION_DEFAULTS.MAX_LIMIT) {
    limit = PAGINATION_DEFAULTS.MAX_LIMIT;
  }

  return { page, limit };
}

/**
 * Calculate offset from page and limit
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Create a paginated response with data and total count
 * Use this when you've already fetched data from database with LIMIT/OFFSET
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: buildPaginationMeta(page, limit, total),
  };
}
