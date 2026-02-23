import { NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8080";

export interface ModelInfo {
  id: string;
  display_name: string;
  provider: string;
}

export interface ProviderInfo {
  name: string;
  enabled: boolean;
  models: ModelInfo[];
}

export interface ModelsResponse {
  providers: ProviderInfo[];
}

/**
 * GET /api/v1/models
 *
 * Proxies to the Go AI service's GET /models endpoint and returns the list
 * of available providers and their models. Only enabled providers (those with
 * a configured API key) should be shown in the UI.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/models`, {
      next: { revalidate: 60 }, // cache for 60s — provider list rarely changes
    });

    if (!res.ok) {
      return NextResponse.json({ providers: [] }, { status: 200 });
    }

    const data: ModelsResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    // Return empty list rather than a 500 — the UI should degrade gracefully
    return NextResponse.json({ providers: [] }, { status: 200 });
  }
}
