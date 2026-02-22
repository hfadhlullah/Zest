"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditorSidebar } from "./EditorSidebar";
import { EditorCanvas } from "./EditorCanvas";
import { EditorPropertiesPanel } from "./EditorPropertiesPanel";
import { ViewportToggle } from "./ViewportToggle";
import { LayersPanel } from "./LayersPanel";
import { ExportModal } from "@/components/export/ExportModal";
import { useExportStore } from "@/store/export.store";
import type { EditorSidebarProps } from "./EditorSidebar";
import type { EditorCanvasProps } from "./EditorCanvas";
import type { EditorPropertiesPanelProps } from "./EditorPropertiesPanel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EditorShellProps {
  sidebarProps?: Omit<EditorSidebarProps, "className">;
  canvasProps?: Omit<EditorCanvasProps, "className">;
  propertiesProps?: Omit<EditorPropertiesPanelProps, "className">;
  /** Ref to the canvas iframe — shared with GenerationCanvas and PropertiesPanel */
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  className?: string;
}

// ---------------------------------------------------------------------------
// Mobile banner
// ---------------------------------------------------------------------------

function MobileBanner() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center md:hidden"
      style={{ background: "var(--color-bg-primary)" }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "var(--color-brand-primary-light)" }}
        aria-hidden="true"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect
            x="2"
            y="6"
            width="24"
            height="16"
            rx="2"
            stroke="var(--color-brand-primary)"
            strokeWidth="2"
          />
          <path
            d="M9 22v2M19 22v2M6 24h16"
            stroke="var(--color-brand-primary)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div>
        <h2
          className="text-xl font-semibold"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text-primary)",
          }}
        >
          Open on desktop
        </h2>
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          The visual editor requires a larger screen.
          <br />
          You can still generate and export on mobile.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditorShell
// ---------------------------------------------------------------------------

export function EditorShell({
  sidebarProps,
  canvasProps,
  propertiesProps,
  iframeRef,
  className,
}: EditorShellProps) {
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const { openExportModal } = useExportStore();

  return (
    <>
      {/* ── Mobile: show banner, hide editor ── */}
      <MobileBanner />

      {/* ── md+: full editor layout ── */}
      <div
        className={cn(
          "hidden h-screen w-screen overflow-hidden md:flex md:flex-row",
          className
        )}
      >
        {/* ── Left sidebar (240px) ── */}
        <EditorSidebar
          {...(sidebarProps ?? {})}
          className="shrink-0"
          layersSlot={iframeRef ? <LayersPanel iframeRef={iframeRef} /> : undefined}
        />

        {/* ── Center canvas (flex-grow) ── */}
        <EditorCanvas
          {...(canvasProps ?? {})}
          className="min-w-0 flex-1"
          toolbarProps={{
            ...(canvasProps?.toolbarProps ?? {}),
            viewportToggle: <ViewportToggle />,
            onExport: openExportModal,
          }}
        />

        {/* ── Right properties panel — desktop only (1280px+) ── */}
        <div className="hidden xl:flex">
          <EditorPropertiesPanel {...(propertiesProps ?? {})} iframeRef={iframeRef} />
        </div>

        {/* ── Tablet slide-over (768–1279px) ── */}
        <div className="xl:hidden">
          <Sheet open={propertiesOpen} onOpenChange={setPropertiesOpen}>
            <SheetContent
              side="right"
              className="w-[280px] p-0"
              style={{
                background: "var(--color-bg-secondary)",
                borderColor: "var(--color-border-default)",
              }}
            >
              <SheetHeader className="border-b px-4 py-3" style={{ borderColor: "var(--color-border-default)" }}>
                <SheetTitle
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Properties
                </SheetTitle>
              </SheetHeader>
              <EditorPropertiesPanel
                {...(propertiesProps ?? {})}
                iframeRef={iframeRef}
                className="border-none"
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ── Export Modal ── */}
      <ExportModal />
    </>
  );
}
