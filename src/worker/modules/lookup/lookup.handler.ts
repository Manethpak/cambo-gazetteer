import { sql } from "drizzle-orm";
import type { DatabaseType } from "~/db";
import type { AdministrativeUnit } from "~/types";

// --- GeoJSON Types ---

type Position = [number, number]; // [lng, lat]
type LinearRing = Position[];
type PolygonCoords = LinearRing[];
type MultiPolygonCoords = PolygonCoords[];

interface GeoJSONFeature {
  type: "Feature";
  properties: {
    adm3_pcode: string;
    adm3_name: string;
    adm2_pcode: string;
    adm2_name: string;
    adm1_pcode: string;
    adm1_name: string;
    [key: string]: unknown;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: PolygonCoords | MultiPolygonCoords;
  };
}

interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// --- Postal Code Types ---

interface PostalEntry {
  postal_code: string;
  code: string;
  name_km: string;
  name_en: string;
  type: string;
}

// --- Lookup Result Types ---

export interface LookupLevel {
  code: string;
  name_en: string;
  name_km: string;
  type: string;
  type_en: string | null;
  type_km: string | null;
  postal_code: string | null;
}

export interface LookupResult {
  province: LookupLevel;
  district: LookupLevel;
  commune: LookupLevel;
  village: null;
}

// --- Point-in-Polygon (Ray Casting) ---

/**
 * Determines if a point is inside a polygon ring using the ray casting algorithm.
 * @param point [lng, lat]
 * @param ring Array of [lng, lat] positions forming a closed polygon ring
 */
function pointInRing(point: Position, ring: LinearRing): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Determines if a point is inside a Polygon geometry.
 * First ring is the exterior, subsequent rings are holes.
 */
function pointInPolygon(point: Position, polygon: PolygonCoords): boolean {
  // Must be inside the exterior ring
  if (!pointInRing(point, polygon[0])) {
    return false;
  }

  // Must not be inside any hole
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(point, polygon[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Determines if a point is inside a MultiPolygon or Polygon geometry.
 */
function pointInGeometry(point: Position, feature: GeoJSONFeature): boolean {
  const { type, coordinates } = feature.geometry;

  if (type === "Polygon") {
    return pointInPolygon(point, coordinates as PolygonCoords);
  }

  if (type === "MultiPolygon") {
    const multiCoords = coordinates as MultiPolygonCoords;
    for (const polygon of multiCoords) {
      if (pointInPolygon(point, polygon)) {
        return true;
      }
    }
  }

  return false;
}

// --- Helper: Strip "KH" prefix from pcodes ---

function stripKhPrefix(pcode: string): string {
  return pcode.startsWith("KH") ? pcode.slice(2) : pcode;
}

// --- Helper: Build a lookup level from DB record or GeoJSON fallback ---

/**
 * Builds a LookupLevel from a DB record if available, otherwise falls back
 * to the GeoJSON property name. This handles cases where the GeoJSON boundary
 * data references older admin codes that no longer exist in the DB
 * (e.g. communes that were later split into sub-units).
 */
function buildLevel(
  dbUnit: AdministrativeUnit | undefined,
  code: string,
  geojsonName: string,
  fallbackType: string,
  postalMap: Map<string, string>,
): LookupLevel {
  if (dbUnit) {
    return {
      code: dbUnit.code,
      name_en: dbUnit.name_en,
      name_km: dbUnit.name_km,
      type: dbUnit.type,
      type_en: dbUnit.type_en,
      type_km: dbUnit.type_km,
      postal_code: postalMap.get(dbUnit.code) ?? null,
    };
  }

  // Fallback: use GeoJSON property name when DB record is missing
  return {
    code,
    name_en: geojsonName,
    name_km: geojsonName, // GeoJSON only has English names
    type: fallbackType,
    type_en: null,
    type_km: null,
    postal_code: postalMap.get(code) ?? null,
  };
}

// --- Main Lookup Function ---

/**
 * Performs a reverse geocode lookup: given a coordinate, finds the commune polygon
 * that contains the point and returns the full admin hierarchy with postal codes.
 */
export async function lookupByCoordinate(
  env: Env,
  db: DatabaseType,
  lat: number,
  lng: number,
): Promise<LookupResult | null> {
  const point: Position = [lng, lat]; // GeoJSON uses [lng, lat]

  // 1. Load commune GeoJSON from ASSETS
  const geojsonResponse = await env.ASSETS.fetch(
    new URL("/data/geo/khm_admin3.geojson", "https://placeholder.local"),
  );

  if (!geojsonResponse.ok) {
    throw new Error("Failed to load commune boundary data");
  }

  const geojson: GeoJSONFeatureCollection = await geojsonResponse.json();

  // 2. Find the commune polygon containing the point
  let matchedFeature: GeoJSONFeature | null = null;

  for (const feature of geojson.features) {
    if (pointInGeometry(point, feature)) {
      matchedFeature = feature;
      break;
    }
  }

  if (!matchedFeature) {
    return null;
  }

  // 3. Extract admin codes from the matched feature properties
  const communeCode = stripKhPrefix(matchedFeature.properties.adm3_pcode);
  const districtCode = stripKhPrefix(matchedFeature.properties.adm2_pcode);
  const provinceCode = stripKhPrefix(matchedFeature.properties.adm1_pcode);

  // 4. Fetch all three admin records from D1 in a single query
  const adminUnits = await db.all<AdministrativeUnit>(sql`
    SELECT code, name_km, name_en, type, type_en, type_km, parent_code
    FROM administrative_units
    WHERE code IN (${provinceCode}, ${districtCode}, ${communeCode})
  `);

  const unitsByCode = new Map(adminUnits.map((u) => [u.code, u]));

  const province = unitsByCode.get(provinceCode);
  const district = unitsByCode.get(districtCode);
  const commune = unitsByCode.get(communeCode);

  // 5. Load postal codes from ASSETS
  const postalResponse = await env.ASSETS.fetch(
    new URL("/data/postal-normalized.json", "https://placeholder.local"),
  );

  let postalMap: Map<string, string> = new Map();

  if (postalResponse.ok) {
    const postalData: PostalEntry[] = await postalResponse.json();
    postalMap = new Map(postalData.map((p) => [p.code, p.postal_code]));
  }

  // 6. Build the response
  //    GeoJSON boundary data may reference older codes that no longer exist
  //    in the DB (e.g. communes that were split). Fall back to GeoJSON
  //    property names when DB records are missing.
  const props = matchedFeature.properties;

  return {
    province: buildLevel(
      province,
      provinceCode,
      props.adm1_name,
      "province",
      postalMap,
    ),
    district: buildLevel(
      district,
      districtCode,
      props.adm2_name,
      "district",
      postalMap,
    ),
    commune: buildLevel(
      commune,
      communeCode,
      props.adm3_name,
      "commune",
      postalMap,
    ),
    village: null,
  };
}
