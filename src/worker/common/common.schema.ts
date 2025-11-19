import z from "zod";

export const administrativeUnitTypeSchema = z.enum([
  "province",
  "municipality",
  "district",
  "commune",
  "village",
]);

export const type_km = z.enum(["ខេត្ត", "ក្រុង", "ស្រុក", "ឃុំ", "ភូមិ"]);

export const type_en = z.enum([
  "province",
  "municipality",
  "district",
  "commune",
  "village",
]);

export const administrativeUnitSchema = z.object({
  code: z.string(),
  name_km: z.string(),
  name_en: z.string(),
  type: administrativeUnitTypeSchema,
  type_en: z.string().nullable(),
  type_km: z.string().nullable(),
  parentCode: z.string().nullable(),
  reference: z.string().nullable().optional(),
  officialNote: z.string().nullable().optional(),
  checkerNote: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

export const paginatedResponseSchema = z.object({
  data: z.array(administrativeUnitSchema),
  pagination: paginationMetaSchema,
});

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: "Page must be greater than 0" })
    .optional(),
  limit: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, {
      message: "Limit must be between 1 and 100",
    })
    .optional(),
});
