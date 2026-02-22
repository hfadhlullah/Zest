import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { exportSchema } from "@/schemas/export.schema";
import { buildZip } from "@/lib/export-service";
import { prisma } from "@/lib/prisma";
import type { ApiError, ErrorCode } from "@/types/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function err(
  status: number,
  code: ErrorCode,
  message: string,
  requestId?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: { code, message } },
    {
      status,
      headers: {
        "X-Request-ID": requestId ?? randomUUID(),
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );
}

// ---------------------------------------------------------------------------
// POST /api/v1/exports
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = req.headers.get("x-request-id") ?? `req_${randomUUID()}`;

  // ── 1. Parse & validate ────────────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return err(400, "VALIDATION_ERROR", "Request body must be valid JSON.", requestId);
  }

  const parsed = exportSchema.safeParse(rawBody);
  if (!parsed.success) {
    return err(400, "VALIDATION_ERROR", "Request validation failed.", requestId);
  }

  const { generation_id, format } = parsed.data;

  // ── 2. Auth context ────────────────────────────────────────────────────────
  const { userId: clerkUserId } = await auth();
  const isAuthenticated = !!clerkUserId;

  // Anonymous users cannot export Tailwind (Permission Matrix §2.2)
  if (!isAuthenticated && format === "tailwind") {
    return err(403, "PLAN_LIMIT_EXCEEDED", "Tailwind export requires a free account. Please sign in.", requestId);
  }

  // ── 3. Fetch generation ────────────────────────────────────────────────────
  const generation = await prisma.generation.findUnique({
    where: { id: generation_id },
    select: { id: true, html: true, css: true, output_format: true, user_id: true },
  });

  if (!generation) {
    return err(404, "NOT_FOUND", "Generation not found.", requestId);
  }

  // ── 4. Build ZIP archive in memory ─────────────────────────────────────────
  let zipBuffer: Buffer;
  try {
    zipBuffer = await buildZip({
      generation: {
        id: generation.id,
        html: generation.html,
        css: generation.css,
        output_format: generation.output_format,
      },
      format,
      isAuthenticated,
    });
  } catch (e) {
    console.error("[exports] buildZip error:", e);
    return err(500, "INTERNAL_ERROR", "Failed to build export archive.", requestId);
  }

  // ── 5. Persist Export record ───────────────────────────────────────────────
  let dbUserId: string | undefined;
  if (clerkUserId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerk_id: clerkUserId },
      select: { id: true },
    });
    if (dbUser) dbUserId = dbUser.id;
  }

  try {
    await prisma.export.create({
      data: {
        generation_id,
        user_id: dbUserId ?? null,
        format,
        file_size_bytes: zipBuffer.byteLength,
      },
    });
  } catch (e) {
    // Non-fatal — log and continue
    console.error("[exports] Failed to persist export record:", e);
  }

  // ── 6. Stream ZIP as file download ─────────────────────────────────────────
  const filename = `zest-export-${generation_id.slice(0, 8)}.zip`;

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zipBuffer.byteLength),
      "X-Request-ID": requestId,
    },
  });
}
