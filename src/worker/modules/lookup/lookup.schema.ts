import z from "zod";
import {
  createResponseBuilder,
  zodSchemaToParameters,
} from "~/utils/openapi-utils";
import { administrativeUnitTypeSchema } from "~/common/common.schema";
import type { DescribeRouteOptions } from "hono-openapi";

const tags = ["Reverse Geocoding"];

/**
 * Query schema for coordinate lookup
 */
export const lookupQuerySchema = z.object({
  lat: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= -90 && val <= 90, {
      message: "Latitude must be a number between -90 and 90",
    })
    .describe("Latitude coordinate (WGS84)"),
  lng: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= -180 && val <= 180, {
      message: "Longitude must be a number between -180 and 180",
    })
    .describe("Longitude coordinate (WGS84)"),
});

/**
 * Schema for a single level in the lookup result
 */
const lookupLevelSchema = z.object({
  code: z.string(),
  name_en: z.string(),
  name_km: z.string(),
  type: administrativeUnitTypeSchema,
  type_en: z.string().nullable(),
  type_km: z.string().nullable(),
  postal_code: z.string().nullable(),
});

/**
 * Response schema for coordinate lookup
 */
export const lookupResultSchema = z.object({
  province: lookupLevelSchema,
  district: lookupLevelSchema,
  commune: lookupLevelSchema,
  village: z.null(),
});

const errorResponseSchema = z.object({
  error: z.string(),
});

/**
 * OpenAPI documentation for GET /v1/lookup
 */
export const getLookupDoc: DescribeRouteOptions = {
  tags,
  description:
    "Reverse geocode a coordinate (latitude, longitude) to determine which administrative area it falls within. Returns the full hierarchy: province, district, and commune with bilingual names and postal codes. Uses point-in-polygon against commune boundary data (admin level 3).",
  parameters: zodSchemaToParameters(lookupQuerySchema),
  responses: createResponseBuilder()
    .ok({
      description:
        "Successfully resolved coordinate to administrative hierarchy",
      schema: lookupResultSchema,
    })
    .badRequest({
      description: "Invalid coordinate parameters",
      schema: errorResponseSchema,
    })
    .notFound({
      description:
        "Coordinate does not fall within any known Cambodian administrative boundary",
      schema: errorResponseSchema,
    })
    .custom(429, {
      description: "Rate limit exceeded (20 requests/minute per IP per Cloudflare location)",
      schema: errorResponseSchema,
    })
    .build(),
};
