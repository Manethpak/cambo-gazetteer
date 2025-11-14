/**
 * Shared TypeScript types for the Cambodia Geo Gazetteer API
 */

import { dbClient } from "../db";

/**
 * Database instance type
 */
export type Database = ReturnType<typeof dbClient>;

/**
 * Administrative unit types
 */
export type AdministrativeUnitType =
  | "province"
  | "municipality"
  | "district"
  | "commune"
  | "village";

/**
 * Breadcrumb item structure
 * Using camelCase to match Drizzle ORM schema naming
 */
export interface BreadcrumbItem {
  code: string;
  nameKm: string;
  nameEn: string;
  type: AdministrativeUnitType;
}

/**
 * Administrative unit basic structure
 * Using camelCase to match Drizzle ORM schema naming
 */
export interface AdministrativeUnit {
  code: string;
  nameKm: string;
  nameEn: string;
  type: AdministrativeUnitType;
  parentCode: string | null;
  reference?: string | null;
  officialNote?: string | null;
  checkerNote?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

/**
 * Search result with hierarchy
 */
export interface SearchResult extends AdministrativeUnit {
  breadcrumb: BreadcrumbItem[];
  path: string;
  rank?: number;
}

/**
 * Location detail with full hierarchy
 */
export interface LocationDetail extends AdministrativeUnit {
  breadcrumb: BreadcrumbItem[];
  path: string;
  ancestors: AdministrativeUnit[];
  children: AdministrativeUnit[];
  siblings: AdministrativeUnit[];
  childrenCount: Array<{ count: number; type: string }>;
}

/**
 * Pagination types
 */
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
 * API response wrappers
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedSearchResponse {
  query: string;
  data: SearchResult[];
  pagination: PaginationMeta;
}

export interface AutocompleteResponse {
  query: string;
  suggestions: AdministrativeUnit[];
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
}

/**
 * Statistics response
 */
export interface StatsResponse {
  total: number;
  byType: {
    provinces: number;
    municipalities: number;
    districts: number;
    communes: number;
    villages: number;
  };
  timestamp: string;
}

/**
 * API info response
 */
export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  endpoints: Record<string, string>;
}
