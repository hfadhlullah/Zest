import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { generateSchema } from "@/schemas/generate.schema";
import {
  checkAnonRateLimit,
  checkFreeUserQuota,
  sha256Hex,
} from "@/lib/rate-limit";
import {
  createGeneration,
  toProviderEnum,
} from "@/lib/generation-service";
import { prisma } from "@/lib/prisma";
import type {
  ApiResponse,
  ApiError,
  GenerateResponseData,
  ErrorCode,
} from "@/types/api";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ?? "http://localhost:8080";

/** 65 seconds — 5s buffer over BR-003's 60s Go timeout */
const PROXY_TIMEOUT_MS = 65_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ok<T>(
  data: T,
  requestId: string,
  rateLimitHeaders?: Record<string, string>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { data },
    {
      status: 201,
      headers: {
        "X-Request-ID": requestId,
        "Content-Type": "application/json; charset=utf-8",
        ...rateLimitHeaders,
      },
    }
  );
}

function err(
  status: number,
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: { code, message, details } },
    {
      status,
      headers: {
        "X-Request-ID": requestId ?? randomUUID(),
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );
}

function rateLimitHeaders(
  limit: number,
  remaining: number,
  resetAt: Date,
  retryAfterSeconds?: number
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.floor(resetAt.getTime() / 1000)),
  };
  if (retryAfterSeconds !== undefined) {
    headers["Retry-After"] = String(retryAfterSeconds);
  }
  return headers;
}

/** Extract client IP, preferring the forwarded header. */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// POST /api/v1/generate
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = req.headers.get("x-request-id") ?? `req_${randomUUID()}`;

  // ── 1. Parse & validate request body ─────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return err(400, "VALIDATION_ERROR", "Request body must be valid JSON.", undefined, requestId);
  }

  const parsed = generateSchema.safeParse(rawBody);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return err(
      400,
      "VALIDATION_ERROR",
      "Request validation failed.",
      { fields },
      requestId
    );
  }

  const { prompt, output_format, project_id, style_hints, previous_generation_id, previous_html, previous_css } = parsed.data;

  // ── 2. Auth check ─────────────────────────────────────────────────────────
  const { userId: clerkUserId } = await auth();

  let dbUserId: string | undefined;
  let userPlan: "free" | "paid" = "free";
  let userGenerationCount = 0;
  let userResetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  if (clerkUserId) {
    // Authenticated — look up our DB user via clerk_id
    const dbUser = await prisma.user.findUnique({
      where: { clerk_id: clerkUserId },
      select: {
        id: true,
        plan: true,
        generation_count: true,
        generation_reset_at: true,
      },
    });
    if (dbUser) {
      dbUserId = dbUser.id;
      userPlan = dbUser.plan;
      userGenerationCount = dbUser.generation_count;
      userResetAt = dbUser.generation_reset_at;
    }
  }

  // ── 3. Rate limiting ──────────────────────────────────────────────────────
  let rlHeaders: Record<string, string>;

  if (!clerkUserId) {
    // Anonymous — IP-based limit (BR-001)
    const ip = getClientIp(req);
    const ipHash = await sha256Hex(ip);
    const rl = await checkAnonRateLimit(ipHash);
    rlHeaders = rateLimitHeaders(rl.limit, rl.remaining, rl.resetAt);

    if (!rl.allowed) {
      const retryAfter = Math.ceil(
        (rl.resetAt.getTime() - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED" as ErrorCode,
            message: "You have used all 3 free anonymous generations today.",
            details: {
              limit: rl.limit,
              used: rl.limit - rl.remaining,
              reset_at: rl.resetAt.toISOString(),
            },
          },
        },
        {
          status: 429,
          headers: {
            "X-Request-ID": requestId,
            "Content-Type": "application/json; charset=utf-8",
            ...rateLimitHeaders(rl.limit, 0, rl.resetAt, retryAfter),
          },
        }
      );
    }
  } else if (userPlan === "free") {
    // Free authenticated user — monthly quota (BR-002)
    // Reset quota counter if past the reset date
    const now = new Date();
    if (now >= userResetAt) {
      if (dbUserId) {
        const nextReset = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
        );
        await prisma.user.update({
          where: { id: dbUserId },
          data: {
            generation_count: 0,
            generation_reset_at: nextReset,
          },
        });
        userGenerationCount = 0;
        userResetAt = nextReset;
      }
    }

    const rl = checkFreeUserQuota(userGenerationCount, userResetAt);
    rlHeaders = rateLimitHeaders(rl.limit, rl.remaining, rl.resetAt);

    if (!rl.allowed) {
      const retryAfter = Math.ceil(
        (rl.resetAt.getTime() - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED" as ErrorCode,
            message: "You have exceeded your monthly generation limit.",
            details: {
              limit: rl.limit,
              used: userGenerationCount,
              reset_at: rl.resetAt.toISOString(),
            },
          },
        },
        {
          status: 429,
          headers: {
            "X-Request-ID": requestId,
            "Content-Type": "application/json; charset=utf-8",
            ...rateLimitHeaders(rl.limit, 0, rl.resetAt, retryAfter),
          },
        }
      );
    }
  } else {
    // Paid user — no generation limit
    rlHeaders = {};
  }

  // ── 4. Proxy to Go AI Service ─────────────────────────────────────────────
  const promptHash = await sha256Hex(prompt);

  // Refinement requests carry previous context and route to /refine (ZEST-014)
  const isRefinement = !!previous_generation_id;

  const goPayload = {
    request_id: requestId,
    user_id: dbUserId ?? "anonymous",
    prompt,
    context: {
      previous_generation_id: previous_generation_id ?? "",
      refinement_target: "",
      previous_html: previous_html ?? "",
      previous_css: previous_css ?? "",
    },
    preferences: {
      output_format,
      style_hints: style_hints ?? "",
    },
  };

  const goEndpoint = isRefinement ? "/refine" : "/generate";

  let goResponse: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      PROXY_TIMEOUT_MS
    );

    goResponse = await fetch(`${AI_SERVICE_URL}${goEndpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      return err(
        504,
        "GENERATION_TIMEOUT",
        "The generation request timed out. Please try again.",
        undefined,
        requestId
      );
    }
    console.error("[generate] Go service fetch error:", e);
    return err(
      503,
      "AI_SERVICE_UNAVAILABLE",
      "The AI service is temporarily unavailable. Please try again shortly.",
      undefined,
      requestId
    );
  }

  // ── 5. Parse Go service response ──────────────────────────────────────────
  let goResult: {
    generation_id: string;
    status: string;
    html: string;
    css: string;
    provider_used: string;
    duration_ms: number;
    token_count?: number;
    error?: string;
  };

  try {
    goResult = await goResponse.json();
  } catch {
    return err(503, "AI_SERVICE_UNAVAILABLE", "Invalid response from AI service.", undefined, requestId);
  }

  if (goResponse.status === 502 || goResult.status === "error") {
    // All providers failed
    return err(
      503,
      "AI_SERVICE_UNAVAILABLE",
      "The AI service could not complete the generation. Please try again.",
      undefined,
      requestId
    );
  }

  if (goResponse.status === 422) {
    // Content moderated by Go service
    return err(
      422,
      "CONTENT_MODERATED",
      "Your prompt was blocked by the content policy. Please revise and try again.",
      undefined,
      requestId
    );
  }

  if (!goResponse.ok) {
    return err(503, "AI_SERVICE_UNAVAILABLE", "Unexpected error from AI service.", undefined, requestId);
  }

  // ── 6. Persist Generation record ─────────────────────────────────────────
  let generationId = goResult.generation_id ?? randomUUID();

  try {
    const gen = await createGeneration({
      projectId: project_id,
      userId: dbUserId,
      promptHash,
      outputFormat: output_format,
      html: goResult.html,
      css: goResult.css || undefined,
      providerUsed: toProviderEnum(goResult.provider_used),
      durationMs: goResult.duration_ms,
      tokenCount: goResult.token_count,
      status: "success",
      parentGenerationId: previous_generation_id,
    });
    generationId = gen.id;
  } catch (e) {
    // Non-fatal — log and continue; client still gets their HTML
    console.error("[generate] Failed to persist generation:", e);
  }

  // ── 7. Return success ─────────────────────────────────────────────────────
  const responseData: GenerateResponseData = {
    generation_id: generationId,
    html: goResult.html,
    css: goResult.css ?? "",
    provider_used: goResult.provider_used,
    duration_ms: goResult.duration_ms,
    cached: false,
  };

  return ok(responseData, requestId, rlHeaders);
}
