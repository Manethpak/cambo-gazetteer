export enum Type {
  MUNICIPALTY = "municipality",
  PROVINCE = "province",
  DISTRICT = "district",
  COMMUNE = "commune",
  VILLAGE = "village",
}

export interface AdministrativeUnit {
  code: string;
  name_en: string;
  name_km: string;
  type: Type;
  type_en: string;
  type_km: string;
  path: string;
  parent_code?: string | null;
  count?: number; // For provinces showing district count, etc.
}

export interface BreadCrumb {
  code: string;
  name_en: string;
  name_km: string;
  type: Type;
  type_en: string;
  type_km: string;
}

export type ResponseByCode = AdministrativeUnit & {
  ancestors: AdministrativeUnit[];
  children: AdministrativeUnit[];
  childrenCount: { count: number; type: Type }[];
  siblings: AdministrativeUnit[];
  breadcrumb: BreadCrumb[];
};

export interface SearchResult {
  code: string;
  name_en: string;
  name_km: string;
  type: Type;
  path: string;
  pathKm: string;
  match_quality?: number;
}

export interface SearchResponse {
  query: string;
  count: number;
  results: SearchResult[];
  error?: string;
}

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

export interface ApiStats {
  provinces: number;
  districts: number;
  communes: number;
  villages: number;
  total: number;
}
