"use client";

import { useEditorStore } from "@/store/editor.store";
import { usePropertyEdit } from "@/hooks/usePropertyEdit";
import { TypographySection } from "./sections/TypographySection";
import { ColorsSection } from "./sections/ColorsSection";
import { SpacingSection } from "./sections/SpacingSection";
import { DimensionsSection } from "./sections/DimensionsSection";
import { BorderSection } from "./sections/BorderSection";
import { LayoutSection } from "./sections/LayoutSection";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PropertiesPanelProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center"
      style={{ color: "var(--color-text-muted)" }}
    >
      {/* Cursor icon */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        style={{ opacity: 0.4 }}
      >
        <path
          d="M8 6l16 10-7 1.5L13 24 8 6z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-xs leading-relaxed" style={{ maxWidth: 180 }}>
        Click an element in the canvas to inspect and edit its styles.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tag label badge
// ---------------------------------------------------------------------------

function TagBadge({ tagName }: { tagName: string }) {
  return (
    <div
      className="flex items-center gap-2 border-b px-4 py-2"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <span
        className="rounded px-1.5 py-0.5 font-mono text-xs"
        style={{
          background: "var(--color-brand-primary-light)",
          color: "var(--color-brand-primary)",
        }}
      >
        {"<" + tagName + ">"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section divider
// ---------------------------------------------------------------------------

function Divider() {
  return (
    <div
      className="h-px"
      style={{ background: "var(--color-border-default)" }}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// PropertiesPanel
// ---------------------------------------------------------------------------

export function PropertiesPanel({ iframeRef }: PropertiesPanelProps) {
  const selectedElement = useEditorStore((s) => s.selectedElement);
  const { applyStyle, currentStyles } = usePropertyEdit(iframeRef);

  if (!selectedElement) {
    return <EmptyState />;
  }

  const { tagName } = selectedElement;
  const display = (currentStyles.display as string) ?? "";
  const isLayout = display === "flex" || display === "inline-flex" || display === "grid" || display === "inline-grid";

  // Typography is relevant for text-bearing elements
  const isTextElement = [
    "p", "h1", "h2", "h3", "h4", "h5", "h6",
    "span", "a", "label", "li", "td", "th",
    "blockquote", "cite", "em", "strong", "small",
    "button",
  ].includes(tagName);

  function onChange(prop: string, value: string) {
    applyStyle(prop, value);
  }

  return (
    <div className="flex flex-col">
      <TagBadge tagName={tagName} />

      {isTextElement && (
        <>
          <TypographySection styles={currentStyles} onChange={onChange} />
          <Divider />
        </>
      )}

      <ColorsSection styles={currentStyles} onChange={onChange} />
      <Divider />

      <DimensionsSection styles={currentStyles} onChange={onChange} />
      <Divider />

      <SpacingSection styles={currentStyles} onChange={onChange} />
      <Divider />

      <BorderSection styles={currentStyles} onChange={onChange} />

      {isLayout && (
        <>
          <Divider />
          <LayoutSection styles={currentStyles} onChange={onChange} />
        </>
      )}
    </div>
  );
}
