import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Project Service
// ---------------------------------------------------------------------------

/**
 * Creates a new project for the authenticated user.
 *
 * @param userId - The user ID (from Clerk/Zest DB)
 * @param name - Project name
 * @param description - Optional project description
 * @returns Created project record
 */
export async function createProject(
  userId: string,
  name: string,
  description?: string
) {
  return db.project.create({
    data: {
      user_id: userId,
      name,
    },
  });
}

/**
 * Fetches all projects for the authenticated user (non-deleted).
 *
 * @param userId - The user ID
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Projects list with pagination metadata
 */
export async function listProjects(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      orderBy: {
        updated_at: "desc",
      },
      skip,
      take: limit,
    }),
    db.project.count({
      where: {
        user_id: userId,
        deleted_at: null,
      },
    }),
  ]);

  return {
    projects,
    total,
    page,
    limit,
  };
}

/**
 * Fetches a single project by ID, verifying ownership.
 *
 * @param projectId - The project ID
 * @param userId - The user ID (for ownership verification)
 * @returns Project record or null if not found or not owned by user
 */
export async function getProject(projectId: string, userId: string) {
  return db.project.findFirst({
    where: {
      id: projectId,
      user_id: userId,
      deleted_at: null,
    },
  });
}

/**
 * Updates a project's metadata.
 * Only the project owner can update their projects.
 *
 * @param projectId - The project ID
 * @param userId - The user ID (for ownership verification)
 * @param data - Fields to update
 * @returns Updated project record or null if not found
 */
export async function updateProject(
  projectId: string,
  userId: string,
  data: {
    name?: string;
    thumbnail_url?: string | null;
    latest_generation_id?: string | null;
  }
) {
  // Verify ownership first
  const project = await getProject(projectId, userId);
  if (!project) {
    return null;
  }

  return db.project.update({
    where: { id: projectId },
    data,
  });
}

/**
 * Soft-deletes a project (sets deleted_at).
 * Only the project owner can delete their projects.
 *
 * @param projectId - The project ID
 * @param userId - The user ID (for ownership verification)
 * @returns Deleted project record or null if not found
 */
export async function deleteProject(projectId: string, userId: string) {
  // Verify ownership first
  const project = await getProject(projectId, userId);
  if (!project) {
    return null;
  }

  return db.project.update({
    where: { id: projectId },
    data: { deleted_at: new Date() },
  });
}
