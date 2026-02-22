"use client";

import { cn } from "@/lib/utils";
import { EditorToolbar } from "./EditorToolbar";
import type { EditorToolbarProps } from "./EditorToolbar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EditorCanvasProps {
  /** The canvas content — GenerationLoader, GenerationCanvas, or EmptyState */
  children?: React.ReactNode;
  /** Forwarded to EditorToolbar */
  toolbarProps?: Omit<EditorToolbarProps, "className">;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorCanvas({
  children,
  toolbarProps,
  className,
}: EditorCanvasProps) {
  return (
    <div
      className={cn("flex min-w-0 flex-1 flex-col overflow-hidden", className)}
      style={{ background: "var(--color-bg-tertiary)" }}
    >
      {/* ── Toolbar ── */}
      <EditorToolbar {...(toolbarProps ?? {})} />

      {/* ── Canvas content ── */}
      <div className="relative flex-1 overflow-auto p-4">
        {children ?? <CanvasEmptyPlaceholder />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Placeholder
// ---------------------------------------------------------------------------

function CanvasEmptyPlaceholder() {
  return (
    <div
      className="flex h-full min-h-64 items-center justify-center rounded-2xl border-2 border-dashed"
      style={{
        borderColor: "var(--color-border-default)",
        color: "var(--color-text-muted)",
      }}
    >
      <p className="text-sm">Generate a UI to see the preview here</p>
    </div>
  );
}
