"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { EditorShell } from "@/components/editor/EditorShell";
import { PromptBar } from "@/components/prompt-bar/PromptBar";
import { GenerationLoader } from "@/components/generation-loader/GenerationLoader";
import { GenerationCanvas } from "@/components/generation-canvas/GenerationCanvas";
import { ErrorState } from "@/components/error-state/ErrorState";
import { UpgradeWall } from "@/components/upgrade-wall/UpgradeWall";
import { useGenerationStore } from "@/store/generation.store";
import { useProjectStore } from "@/store/project.store";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useEditorKeyboard } from "@/hooks/useEditorKeyboard";

// ---------------------------------------------------------------------------
// Editor page — wires EditorShell + generation flow + auto-save
// ---------------------------------------------------------------------------

export default function EditorPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const abortRef = useRef<AbortController | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const projectId = typeof params.id === "string" ? params.id : null;

  // Register global keyboard shortcuts (Delete, Cmd+Z, Cmd+Shift+Z)
  useEditorKeyboard(iframeRef);

  // Register auto-save (only when project is loaded)
  const { currentProject } = useProjectStore();
  useAutoSave({ interval: 5000, enabled: !!projectId && !!currentProject });

  const {
    prompt,
    result,
    format,
    isLoading,
    error,
    setPrompt,
    setFormat,
    setLoading,
    setResult,
    setError,
  } = useGenerationStore();

  // ── Cancel helper ──
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, [setLoading]);

  // ── Core generation logic ──
  const handleGenerate = useCallback(
    async (value: string) => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/v1/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: value, output_format: format }),
          signal: controller.signal,
        });

        // Log X-Request-ID for debugging (AC: ZEST-007)
        const requestId = response.headers.get("X-Request-ID");
        if (requestId) console.debug("[Zest] X-Request-ID:", requestId);

        if (!response.ok) {
          const apiError = await response.json().catch(() => null);
          setError({
            code: apiError?.error?.code ?? "INTERNAL_ERROR",
            message:
              apiError?.error?.message ?? "An unexpected error occurred.",
          });
          return;
        }

        const json = await response.json();
        setResult(json.data);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError({
          code: "INTERNAL_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred.",
        });
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setLoading(false);
        }
      }
    },
    [format, setLoading, setError, setResult]
  );

  // ── Auto-trigger from URL param (navigate from homepage) ──
  useEffect(() => {
    const initialPrompt = searchParams.get("prompt");
    if (initialPrompt && !result && !isLoading) {
      setPrompt(initialPrompt);
      handleGenerate(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = useCallback(() => {
    if (prompt) handleGenerate(prompt);
  }, [prompt, handleGenerate]);

  const handleSubmit = useCallback(
    (value: string) => {
      setPrompt(value);
      handleGenerate(value);
    },
    [setPrompt, handleGenerate]
  );

  const isRateLimit =
    error?.code === "RATE_LIMIT_EXCEEDED" ||
    error?.code === "PLAN_LIMIT_EXCEEDED";

  // ── Canvas content ──
  const canvasContent = (
    <div className="flex h-full flex-col gap-4">
      {/* PromptBar — always visible at top of canvas */}
      <PromptBar
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleSubmit}
        loading={isLoading}
        format={format}
        onFormatChange={setFormat}
      />

      {/* Generation area */}
      <div className="flex flex-1 items-center justify-center">
        {isLoading && (
          <GenerationLoader
            onCancel={cancel}
            className="w-full max-w-2xl"
          />
        )}

        {!isLoading && error && (
          <>
            {isRateLimit ? (
              <UpgradeWall className="w-full max-w-md" />
            ) : (
              <ErrorState
                code={error.code}
                message={error.message}
                onPrimaryAction={handleRegenerate}
                onSecondaryAction={() => setError(null)}
                className="w-full max-w-md"
              />
            )}
          </>
        )}

        {!isLoading && !error && result && (
          <GenerationCanvas
            html={result.html}
            css={result.css}
            format={format}
            interactive
            iframeRef={iframeRef}
            className="h-full w-full"
          />
        )}

        {!isLoading && !error && !result && (
          <div
            className="flex flex-col items-center gap-2 text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            <p className="text-sm">Enter a prompt above to generate a UI</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <EditorShell
      iframeRef={iframeRef}
      sidebarProps={{ projectName: "Untitled Project" }}
      canvasProps={{
        children: canvasContent,
        toolbarProps: {
          hasResult: !!result && !isLoading,
          onRegenerate: handleRegenerate,
        },
      }}
    />
  );
}
