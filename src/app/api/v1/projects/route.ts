import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createProjectSchema } from "@/schemas/projects.schema";
import { createProject, listProjects } from "@/lib/project-service";

// ---------------------------------------------------------------------------
// POST /api/v1/projects — Create project
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from DB
    const user = await db.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Create project
    const project = await createProject(user.id, parsed.data.name);

    return NextResponse.json(
      { data: project },
      { status: 201 }
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Projects POST]", errorMsg);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/projects — List projects
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from DB
    const user = await db.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    );

    // Fetch projects
    const result = await listProjects(user.id, page, limit);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Projects GET]", errorMsg);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
