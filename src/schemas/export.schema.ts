import { z } from "zod";

/**
 * Zod schema for POST /api/v1/exports request body.
 */
export const exportSchema = z.object({
  generation_id: z.string().uuid("generation_id must be a valid UUID."),
  format: z
    .enum(["html_css", "tailwind"], {
      message: "Must be one of: html_css, tailwind.",
    })
    .optional()
    .default("html_css"),
});

export type ExportInput = z.infer<typeof exportSchema>;
