import z from "zod";

export const ParamSchema = z.string().min(1, "Code parameter is required");
