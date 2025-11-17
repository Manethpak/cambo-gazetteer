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

const statsDetailResponseSchema = z.object({
  total: z.number().describe("Total number of administrative units"),
  provinces: z.array(
    z.object({
      code: z.string().describe("Province/municipality code"),
      name: z.string().describe("Province/municipality name in English"),
      nameKm: z.string().describe("Province/municipality name in Khmer"),
      type: z.string().describe("Type: province or municipality"),
      typeEn: z
        .string()
        .optional()
        .describe("English type (e.g., Khet, Krong)"),
      typeKm: z.string().optional().describe("Khmer type (ខេត្ត, ក្រុង)"),
      district: z.object({
        Khan: z.number().describe("Number of Khan/ខណ្ឌ districts (urban)"),
        Srok: z.number().describe("Number of Srok/ស្រុក districts (rural)"),
        Krong: z.number().describe("Number of Krong/ក្រុង districts (city)"),
        total: z.number().describe("Total number of districts"),
      }),
      commune: z.object({
        Sangkat: z
          .number()
          .describe("Number of Sangkat/សង្កាត់ communes (urban)"),
        Khum: z.number().describe("Number of Khum/ឃុំ communes (rural)"),
        total: z.number().describe("Total number of communes"),
      }),
      village: z.object({
        Phum: z.number().describe("Number of Phum/ភូមិ villages"),
        total: z.number().describe("Total number of villages/Phum (ភូមិ)"),
      }),
    })
  ),
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

export const getDetailStatsDoc = {
  tags,
  description:
    "Detailed statistics on administrative units, including breakdowns per province with counts of districts, communes, and villages.",
  responses: createResponseBuilder()
    .ok({
      description: "Successfully retrieved detailed statistics",
      schema: statsDetailResponseSchema,
    })
    .build(),
};
