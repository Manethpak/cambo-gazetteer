import z from "zod";
import { createResponseBuilder } from "~/utils/openapi-utils";
import {
  administrativeUnitTypeSchema,
  administrativeUnitSchema,
} from "~/common/common.schema";

const breadcrumbItemSchema = z.object({
  code: z.string(),
  nameKm: z.string(),
  nameEn: z.string(),
  type: administrativeUnitTypeSchema,
});

const childrenCountSchema = z.object({
  count: z.number(),
  type: z.string(),
});

const locationDetailSchema = z.object({
  code: z.string(),
  nameKm: z.string(),
  nameEn: z.string(),
  type: administrativeUnitTypeSchema,
  parentCode: z.string().nullable(),
  reference: z.string().nullable().optional(),
  officialNote: z.string().nullable().optional(),
  checkerNote: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  breadcrumb: z.array(breadcrumbItemSchema),
  path: z.string(),
  ancestors: z.array(administrativeUnitSchema),
  children: z.array(administrativeUnitSchema),
  siblings: z.array(administrativeUnitSchema),
  childrenCount: z.array(childrenCountSchema),
});

const errorResponseSchema = z.object({
  error: z.string(),
});

export const codeParamSchema = z.object({
  code: z.string().min(1, "Code parameter is required"),
});

export const getLocationByCodeDoc = {
  tags: ["Administrative Codes"],
  description:
    "Retrieves detailed information about a specific administrative location by its unique code. Returns the location with full hierarchical context including breadcrumb path, ancestors (parent locations), children (sub-locations), siblings (locations at the same level), and children count statistics. Useful for displaying detailed location information and navigation.",
  request: {
    params: z.object({
      code: z
        .string()
        .describe(
          "Administrative code (e.g., '01' for province, '0101' for district, '010101' for commune, '01010101' for village)"
        ),
    }),
  },
  responses: createResponseBuilder()
    .ok({
      description: "Successfully retrieved location details",
      schema: locationDetailSchema,
    })
    .notFound({
      description: "Location not found for the given code",
      schema: errorResponseSchema,
    })
    .build(),
};
