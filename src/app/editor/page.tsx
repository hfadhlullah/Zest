"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { CodeViewer } from "@/components/editor/CodeViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, SignIn } from "@clerk/nextjs";

// ---------------------------------------------------------------------------
// Editor page — wires EditorShell + generation flow + auto-save
// ---------------------------------------------------------------------------

import { Suspense } from "react";

function EditorPageContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const abortRef = useRef<AbortController | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");

  const projectId = typeof params.id === "string" ? params.id : null;
  const { isSignedIn, isLoaded } = useUser();

  // Register global keyboard shortcuts (Delete, Cmd+Z, Cmd+Shift+Z)
  useEditorKeyboard(iframeRef);

  // Register auto-save (only when project is loaded)
  const { currentProject } = useProjectStore();
  useAutoSave({ interval: 5000, enabled: !!projectId && !!currentProject });

  const {
    prompt,
    result,
    format,
    selectedModel,
    isLoading,
    error,
    setPrompt,
    setFormat,
    setSelectedModel,
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
          body: JSON.stringify({
            prompt: value,
            output_format: format,
            preferred_provider: selectedModel?.provider,
            preferred_model: selectedModel?.model,
          }),
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
    [format, selectedModel, setLoading, setError, setResult]
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

  const hasResult = !!result && !isLoading;

  // ── Viewport Toggle (Custom Toolbar Override) ── 
  const viewportToggle = (
    <div className="flex items-center gap-1 border shadow-sm rounded-lg bg-background p-1">
      <button
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === "visual" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"}`}
        onClick={() => setViewMode("visual")}
      >
        Visual
      </button>
      <button
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === "code" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"}`}
        onClick={() => setViewMode("code")}
      >
        Code
      </button>
    </div>
  );

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
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {/* Generation area */}
      <div className="flex flex-1 items-center justify-center relative overflow-hidden">
        {isLoading && (
          <GenerationLoader
            onCancel={cancel}
            className="h-full w-full rounded-none"
          />
        )}

        {!isLoading && error && (
          <>
            {isRateLimit ? (
              isSignedIn ? (
                <div className="flex flex-col items-center gap-4">
                  <UpgradeWall className="w-full max-w-md" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full max-w-md rounded-2xl bg-background border p-4 shadow-sm">
                  <div className="text-center space-y-2 mb-4">
                    <h3 className="text-xl font-bold">Sign up to keep generating</h3>
                    <p className="text-muted-foreground text-sm">You've reached the guest limit. Create an account to continue building.</p>
                  </div>
                  <SignIn routing="hash" forceRedirectUrl={`/editor?prompt=${encodeURIComponent(prompt)}`} signUpUrl="/sign-up" />
                </div>
              )
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
          <div className="w-full h-full flex flex-col relative">
            {viewMode === "visual" ? (
              <GenerationCanvas
                html={result.html}
                css={result.css}
                format={format}
                interactive
                iframeRef={iframeRef}
                className="h-full w-full transition-opacity duration-300"
              />
            ) : (
              <CodeViewer
                html={result.html}
                css={result.css}
                className="h-full w-full transition-opacity duration-300"
              />
            )}
          </div>
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
          hasResult: hasResult,
          onRegenerate: handleRegenerate,
          viewportToggle: hasResult ? viewportToggle : undefined
        },
      }}
    />
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Loading Editor...</div>}>
      <EditorPageContent />
    </Suspense>
  );
}
