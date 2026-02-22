"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PropertiesPanel } from "./properties/PropertiesPanel";
import { ChatPanel } from "./chat/ChatPanel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EditorPropertiesPanelProps {
  /**
   * Ref to the canvas iframe — forwarded into PropertiesPanel so style edits
   * can be applied live via IframeBridge, and into ChatPanel for refinement.
   */
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorPropertiesPanel({
  iframeRef,
  className,
}: EditorPropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<"properties" | "chat">(
    "properties"
  );

  return (
    <aside
      className={cn(
        "flex h-full flex-col overflow-hidden border-l",
        className
      )}
      style={{
        background: "var(--color-bg-secondary)",
        borderColor: "var(--color-border-default)",
        minWidth: 280,
        maxWidth: 280,
        width: 280,
      }}
      aria-label="Properties panel"
    >
      {/* ── Tabs ── */}
      <div
        className="flex items-center border-b"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        {["properties", "chat"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "properties" | "chat")}
            className={cn(
              "flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider",
              "border-b-2 transition-colors duration-150"
            )}
            style={{
              color:
                activeTab === tab
                  ? "var(--color-text-primary)"
                  : "var(--color-text-muted)",
              borderColor:
                activeTab === tab
                  ? "var(--color-brand-primary)"
                  : "transparent",
            }}
          >
            {tab === "properties" ? "Properties" : "Chat"}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "properties" ? (
          <div className="h-full overflow-y-auto">
            {iframeRef ? (
              <PropertiesPanel iframeRef={iframeRef} />
            ) : (
              <PropertiesEmptyPlaceholder />
            )}
          </div>
        ) : (
          <ChatPanel iframeRef={iframeRef} className="h-full" />
        )}
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Placeholder (shown before iframeRef is available)
// ---------------------------------------------------------------------------

function PropertiesEmptyPlaceholder() {
  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <PlaceholderSection label="Typography" rows={3} />
      <PlaceholderSection label="Colors" rows={2} />
      <PlaceholderSection label="Spacing" rows={4} />
    </div>
  );
}

function PlaceholderSection({
  label,
  rows,
}: {
  label: string;
  rows: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div
              className="h-2.5 w-20 rounded"
              style={{ background: "var(--color-border-default)" }}
            />
            <div
              className="h-7 w-24 rounded-md"
              style={{ background: "var(--color-border-default)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
