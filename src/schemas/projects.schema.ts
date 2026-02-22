import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/projects — Create project
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or less")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * PATCH /api/v1/projects/:id — Update project
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or less")
    .trim()
    .optional(),
  thumbnail_url: z
    .string()
    .url("Invalid URL")
    .max(500, "URL must be 500 characters or less")
    .optional()
    .or(z.null()),
  latest_generation_id: z.string().uuid().optional().or(z.null()),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * Response: Single project
 */
export const projectResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  thumbnail_url: z.string().nullable(),
  latest_generation_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
});

export type ProjectResponse = z.infer<typeof projectResponseSchema>;

/**
 * Response: List of projects
 */
export const listProjectsResponseSchema = z.object({
  projects: z.array(projectResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type ListProjectsResponse = z.infer<typeof listProjectsResponseSchema>;
