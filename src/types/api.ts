/**
 * Shared API response types.
 * All endpoints use the envelope format defined in docs/api-standards.md §4.
 */

// ---------------------------------------------------------------------------
// Success envelope
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  pagination: {
    cursor: string | null;
    has_more: boolean;
    limit: number;
  };
}

// ---------------------------------------------------------------------------
// Error envelope
// ---------------------------------------------------------------------------

export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "PLAN_LIMIT_EXCEEDED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "CONTENT_MODERATED"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR"
  | "AI_SERVICE_UNAVAILABLE"
  | "GENERATION_TIMEOUT";

// ---------------------------------------------------------------------------
// Generation endpoint types
// ---------------------------------------------------------------------------

export interface GenerateRequestBody {
  prompt: string;
  output_format?: "html_css" | "tailwind";
  project_id?: string;
  style_hints?: string;
}

export interface GenerateResponseData {
  generation_id: string;
  html: string;
  css: string;
  provider_used: string;
  duration_ms: number;
  cached: boolean;
}

// ---------------------------------------------------------------------------
// Rate limit result (internal)
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
}
