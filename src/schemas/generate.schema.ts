import { z } from "zod";

/**
 * Zod schema for POST /api/v1/generate request body.
 * Enforces api-standards.md §3.3 and §3.4 constraints.
 */

/** Sanitize a string: strip null bytes, trim, normalize Unicode NFC. */
function sanitize(val: string): string {
  return val
    .replace(/\0/g, "") // strip null bytes
    .trim()
    .normalize("NFC");
}

export const generateSchema = z.object({
  prompt: z
    .string({ error: "prompt is required" })
    .transform(sanitize)
    .pipe(
      z
        .string()
        .min(10, "Prompt must be at least 10 characters.")
        .max(2000, "Prompt must be at most 2000 characters.")
    ),

  output_format: z
    .enum(["html_css", "tailwind"], {
      message: "Must be one of: html_css, tailwind.",
    })
    .optional()
    .default("html_css"),

  project_id: z
    .string()
    .uuid("project_id must be a valid UUID.")
    .optional(),

  style_hints: z
    .string()
    .transform(sanitize)
    .pipe(z.string().max(500, "style_hints must be at most 500 characters."))
    .optional(),

  // Preferred provider/model — optional, user-selected
  preferred_provider: z.string().optional(),
  preferred_model: z.string().optional(),

  // Refinement context — present when this is a chat refinement (ZEST-014/015)
  previous_generation_id: z.string().optional(),
  previous_html: z.string().optional(),
  previous_css: z.string().optional(),
});

export type GenerateInput = z.infer<typeof generateSchema>;
