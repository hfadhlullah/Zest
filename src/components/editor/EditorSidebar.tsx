"use client";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EditorSidebarProps {
  /** Slot for the layers tree — populated by ZEST-013 */
  layersSlot?: React.ReactNode;
  /** Project name shown in the header */
  projectName?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorSidebar({
  layersSlot,
  projectName = "Untitled Project",
  className,
}: EditorSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-60 shrink-0 flex-col overflow-hidden border-r",
        className
      )}
      style={{
        background: "var(--color-bg-secondary)",
        borderColor: "var(--color-border-default)",
        minWidth: 240,
        maxWidth: 240,
      }}
      aria-label="Layers panel"
    >
      {/* ── Project name ── */}
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{ background: "var(--color-brand-primary)" }}
          aria-hidden="true"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 9 L6 3 L10 9"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.5 7H8.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span
          className="truncate text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
          title={projectName}
        >
          {projectName}
        </span>
      </div>

      {/* ── Layers heading ── */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          Layers
        </span>
      </div>

      {/* ── Layers tree slot ── */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {layersSlot ?? <LayersEmptyPlaceholder />}
      </div>

      {/* ── Footer divider ── */}
      <div
        className="border-t px-4 py-3"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <span
          className="text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          No elements selected
        </span>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Placeholder
// ---------------------------------------------------------------------------

function LayersEmptyPlaceholder() {
  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      {/* Skeleton rows */}
      {[80, 60, 72, 50].map((w, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-md px-2 py-1.5"
        >
          <div
            className="h-3.5 w-3.5 shrink-0 rounded"
            style={{ background: "var(--color-border-default)" }}
          />
          <div
            className="h-2.5 rounded"
            style={{
              width: `${w}%`,
              background: "var(--color-border-default)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
