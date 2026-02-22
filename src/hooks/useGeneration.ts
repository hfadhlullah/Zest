"use client";

import { useCallback, useRef, useState } from "react";
import type {
  ApiError,
  ErrorCode,
  GenerateRequestBody,
  GenerateResponseData,
} from "@/types/api";
import type { OutputFormat } from "@/components/prompt-bar/PromptBar.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerationError {
  /** Machine-readable error code from the API envelope */
  code: ErrorCode;
  /** Human-readable message */
  message: string;
}

export interface UseGenerationReturn {
  /** Trigger a generation request */
  generate: (prompt: string, format?: OutputFormat, projectId?: string) => Promise<void>;
  /** True while the fetch is in-flight */
  isLoading: boolean;
  /** Successful generation result */
  result: GenerateResponseData | null;
  /** Error details if the last request failed */
  error: GenerationError | null;
  /** Abort the in-flight request */
  cancel: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGeneration(): UseGenerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponseData | null>(null);
  const [error, setError] = useState<GenerationError | null>(null);

  // Keep an AbortController ref so cancel() always cancels the latest request
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const generate = useCallback(
    async (
      prompt: string,
      format: OutputFormat = "html_css",
      projectId?: string
    ) => {
      // Cancel any in-flight request before starting a new one
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setResult(null);

      const body: GenerateRequestBody = {
        prompt,
        output_format: format,
        ...(projectId ? { project_id: projectId } : {}),
      };

      try {
        const response = await fetch("/api/v1/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          // Parse the API error envelope
          let code: ErrorCode = "INTERNAL_ERROR";
          let message = "An unexpected error occurred.";

          try {
            const apiError = (await response.json()) as ApiError;
            code = apiError.error.code;
            message = apiError.error.message;
          } catch {
            // JSON parse failed — use defaults
          }

          setError({ code, message });
          return;
        }

        const json = await response.json();
        setResult(json.data as GenerateResponseData);
      } catch (err) {
        // AbortError means the user cancelled — don't treat as an error
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError({
          code: "INTERNAL_ERROR",
          message:
            err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      } finally {
        // Only clear loading if this controller is still the active one
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsLoading(false);
        }
      }
    },
    []
  );

  return { generate, isLoading, result, error, cancel };
}
