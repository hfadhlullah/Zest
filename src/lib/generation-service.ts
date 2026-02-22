import { prisma } from "@/lib/prisma";
import type {
  Generation,
  OutputFormat,
  ProviderUsed,
  GenerationStatus,
} from "@/generated/prisma";

/**
 * Data required to persist a Generation record.
 */
export interface CreateGenerationData {
  projectId?: string;
  userId?: string;
  promptHash: string;
  outputFormat: OutputFormat;
  html: string;
  css?: string;
  providerUsed: ProviderUsed;
  durationMs: number;
  tokenCount?: number;
  status: GenerationStatus;
  parentGenerationId?: string;
}

/**
 * Persist a new Generation row and — for authenticated free users —
 * atomically increment their monthly generation counter.
 *
 * BR-002: generation_count is incremented only on status === "success".
 */
export async function createGeneration(
  data: CreateGenerationData
): Promise<Generation> {
  const generation = await prisma.$transaction(async (tx) => {
    const gen = await tx.generation.create({
      data: {
        project_id: data.projectId ?? null,
        user_id: data.userId ?? null,
        prompt_hash: data.promptHash,
        output_format: data.outputFormat,
        html: data.html,
        css: data.css ?? null,
        provider_used: data.providerUsed,
        duration_ms: data.durationMs,
        token_count: data.tokenCount ?? null,
        status: data.status,
        parent_generation_id: data.parentGenerationId ?? null,
      },
    });

    // Increment user generation counter on success (BR-002)
    if (data.userId && data.status === "success") {
      await tx.user.update({
        where: { id: data.userId },
        data: { generation_count: { increment: 1 } },
      });
    }

    return gen;
  });

  return generation;
}

/**
 * Map the provider name string from the Go service to the Prisma enum.
 * Falls back to "glm" if unrecognised (should never happen in practice).
 */
export function toProviderEnum(name: string): ProviderUsed {
  switch (name.toLowerCase()) {
    case "gemini":
      return "gemini";
    case "copilot":
    case "github_copilot":
      return "github_copilot";
    default:
      return "glm";
  }
}
