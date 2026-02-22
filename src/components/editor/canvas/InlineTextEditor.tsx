"use client";

import { useEffect, useRef } from "react";
import type { ElementDescriptor } from "@/store/editor.store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InlineTextEditorProps {
  /** The element being edited */
  element: ElementDescriptor;
  /** Ref to the iframe (needed for commit) */
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  /** Called when the user commits the edit (blur / Enter on inline elements) */
  onCommit: (
    iframeRef: React.RefObject<HTMLIFrameElement | null>,
    text: string
  ) => void;
  /** Called when the user cancels (Escape) */
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Tag sets
// ---------------------------------------------------------------------------

/** Block-level text elements where Enter submits (to avoid inserting newlines) */
const SINGLE_LINE_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "button", "a", "label", "span",
]);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * An absolutely-positioned `contenteditable` div overlaid on the selected
 * element inside the canvas. It inherits the element's font styles so the
 * editing experience feels in-place.
 *
 * Positioning is in overlay-coordinate space (same as SelectionBox.rect).
 */
export function InlineTextEditor({
  element,
  iframeRef,
  onCommit,
  onCancel,
}: InlineTextEditorProps) {
  const editableRef = useRef<HTMLDivElement>(null);
  const { rect, currentStyles, textContent, tagName } = element;
  const isSingleLine = SINGLE_LINE_TAGS.has(tagName);

  // Auto-focus and select all on mount
  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    el.focus();
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, []);

  function handleBlur() {
    const text = editableRef.current?.textContent ?? "";
    onCommit(iframeRef, text.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
      return;
    }
    // For single-line tags, Enter commits instead of inserting a newline
    if (e.key === "Enter" && isSingleLine) {
      e.preventDefault();
      const text = editableRef.current?.textContent ?? "";
      onCommit(iframeRef, text.trim());
    }
  }

  return (
    <div
      ref={editableRef}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={!isSingleLine}
      aria-label={`Edit text of ${tagName} element`}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      // Stop click/mousedown from bubbling to the canvas overlay
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute z-30 overflow-hidden outline-none"
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        minHeight: rect.height,
        // Mirror the element's computed font styles for in-place feel
        fontSize: (currentStyles.fontSize as string) || "inherit",
        fontFamily: (currentStyles.fontFamily as string) || "inherit",
        fontWeight: (currentStyles.fontWeight as string) || "inherit",
        lineHeight: (currentStyles.lineHeight as string) || "inherit",
        letterSpacing: (currentStyles.letterSpacing as string) || "inherit",
        textAlign: ((currentStyles.textAlign as string) || "inherit") as React.CSSProperties["textAlign"],
        color: (currentStyles.color as string) || "inherit",
        // Editing chrome
        background: "var(--color-bg-primary)",
        border: "2px solid var(--color-brand-primary)",
        borderRadius: 4,
        padding: "2px 4px",
        boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
        cursor: "text",
        whiteSpace: isSingleLine ? "nowrap" : "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {textContent}
    </div>
  );
}
