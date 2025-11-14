import z from "zod";
import { createResponseBuilder } from "~/utils/openapi-utils";

const tags = ["Statistics"];

/**
 * Response schema for statistics endpoint
 */
const statsResponseSchema = z.object({
  total: z.number().describe("Total number of administrative units"),
  byType: z.object({
    provinces: z.number().describe("Number of provinces (ខេត្ត)"),
    municipalities: z
      .number()
      .describe("Number of municipalities/cities (ក្រុង)"),
    districts: z.number().describe("Number of districts (ស្រុក/ខណ្ឌ)"),
    communes: z.number().describe("Number of communes (ឃុំ/សង្កាត់)"),
    villages: z.number().describe("Number of villages (ភូមិ)"),
  }),
  timestamp: z
    .string()
    .datetime()
    .describe("Timestamp when stats were generated"),
});

/**
 * GET /stats route documentation
 */
export const getStatsDoc = {
  tags,
  description:
    "Sstatistics on all administrative units in the Cambodia Geo Gazetteer database. " +
    "Includes total counts and breakdowns by type (provinces, municipalities, districts, communes, villages). ",
  responses: createResponseBuilder()
    .ok({
      description: "Successfully retrieved statistics",
      schema: statsResponseSchema,
    })
    .build(),
};
