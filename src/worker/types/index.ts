/**
 * Shared TypeScript types for the Cambodia Geo Gazetteer API
 */

import type { DrizzleD1Database } from "drizzle-orm/d1";

/**
 * Database instance type
 */
export type Database = DrizzleD1Database<Record<string, never>>;

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
 * API response wrappers
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ListResponse<T> {
  count: number;
  results: T[];
}

export interface SearchResponse {
  query: string;
  count: number;
  results: SearchResult[];
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
 * API info response
 */
export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  endpoints: Record<string, string>;
}
