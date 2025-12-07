import z from "zod";
import { createResponseBuilder, zodSchemaToParameters } from "~/utils/openapi-utils";
import { paginatedResponseSchema, paginationQuerySchema } from "~/common/common.schema";
import { DescribeRouteOptions } from "hono-openapi";

const tags = ["Administrative"];
/**
 * Query schemas for validators
 */
export const districtsQuerySchema = paginationQuerySchema.extend({
  province: z
    .string()
    .optional()
    .describe("Filter districts by province code (e.g., '1' for Banteay Meanchey)"),
});

export const communesQuerySchema = paginationQuerySchema.extend({
  district: z
    .string()
    .optional()
    .describe("Filter communes by district code (e.g., '101' for Serei Saophoan)"),
});

export const villagesQuerySchema = paginationQuerySchema.extend({
  commune: z
    .string()
    .optional()
    .describe("Filter villages by commune code (e.g., '10101' for Serei Saophoan)"),
});

/**
 * Route documentation configurations
 */

export const getProvincesDoc = {
  tags,
  description: "Returns all provinces and municipalities (ខេត្ត/ក្រុង).",
  responses: createResponseBuilder()
    .ok({
      description: "Successfully retrieved provinces and municipalities",
      schema: paginatedResponseSchema,
    })
    .build(),
};

export const getDistrictsDoc: DescribeRouteOptions = {
  tags,
  description:
    "Returns a paginated list of districts. Can be filtered by province code using the 'province' query parameter. Supports pagination via 'page' and 'limit' query parameters (defaults: page=1, limit=20).",
  parameters: zodSchemaToParameters(districtsQuerySchema),
  responses: createResponseBuilder()
    .ok({
      description: "Successfully retrieved districts",
      schema: paginatedResponseSchema.extend({
        provinceCode: z.string().optional(),
      }),
    })
    .build(),
};

export const getCommunesDoc: DescribeRouteOptions = {
  tags,
  description:
    "Returns a paginated list of communes. Can be filtered by district code using the 'district' query parameter. Supports pagination via 'page' and 'limit' query parameters (defaults: page=1, limit=20).",
  parameters: zodSchemaToParameters(communesQuerySchema),
  responses: createResponseBuilder()
    .ok({
      description: "Successfully retrieved communes",
      schema: paginatedResponseSchema.extend({
        districtCode: z.string().optional(),
      }),
    })
    .build(),
};

export const getVillagesDoc: DescribeRouteOptions = {
  tags,
  description:
    "Returns a paginated list of villages. Can be filtered by commune code using the 'commune' query parameter. Supports pagination via 'page' and 'limit' query parameters (defaults: page=1, limit=20).",
  parameters: zodSchemaToParameters(villagesQuerySchema),
  responses: createResponseBuilder()
    .ok({
      description: "Successfully retrieved villages",
      schema: paginatedResponseSchema.extend({
        communeCode: z.string().optional(),
      }),
    })
    .build(),
};
