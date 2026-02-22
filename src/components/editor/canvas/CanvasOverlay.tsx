"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor.store";
import {
  resolveElementAtPoint,
  buildElementDescriptor,
} from "@/lib/editor/element-resolver";
import { stampIds } from "@/lib/editor/iframe-bridge";
import { useInlineEdit } from "@/hooks/useInlineEdit";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Tags that support inline text editing */
const EDITABLE_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "span", "a", "label", "li", "td", "th",
  "blockquote", "cite", "em", "strong", "small",
  "button",
]);

export interface CanvasOverlayProps {
  /** Ref to the iframe being overlaid */
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  /** Whether the overlay is active (disabled when loading) */
  active?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A transparent `<div>` layered directly over the GenerationCanvas iframe.
 * It intercepts pointer events, resolves the target element inside the iframe,
 * and updates the editor store with the selection.
 *
 * Double-clicking a text element activates inline text editing.
 *
 * Positioning: the parent container must be `position: relative`.
 * This overlay uses `position: absolute; inset: 0`.
 */
export function CanvasOverlay({
  iframeRef,
  active = true,
  className,
}: CanvasOverlayProps) {
  const { setSelectedElement, selectedElement } = useEditorStore();
  const { startEditing } = useInlineEdit();
  const overlayRef = useRef<HTMLDivElement>(null);

  // ── Stamp ids whenever iframe content changes ──
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function handleLoad() {
      if (iframe) stampIds(iframe);
    }

    iframe.addEventListener("load", handleLoad);
    // Stamp immediately in case content was already written
    if (iframe.contentDocument?.readyState === "complete") {
      stampIds(iframe);
    }

    return () => iframe.removeEventListener("load", handleLoad);
  }, [iframeRef]);

  // ── Click handler — selects element ──
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!active) return;

      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument ?? iframe?.contentWindow?.document;
      if (!iframe || !doc) return;

      const el = resolveElementAtPoint(e.clientX, e.clientY, {
        iframe,
        doc,
      });

      if (!el) {
        setSelectedElement(null);
        return;
      }

      const descriptor = buildElementDescriptor(el, iframe);
      setSelectedElement(descriptor);
    },
    [active, iframeRef, setSelectedElement]
  );

  // ── Double-click handler — activates inline text editing ──
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!active) return;

      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument ?? iframe?.contentWindow?.document;
      if (!iframe || !doc) return;

      const el = resolveElementAtPoint(e.clientX, e.clientY, {
        iframe,
        doc,
      });

      if (!el) return;

      const descriptor = buildElementDescriptor(el, iframe);

      // Only allow inline editing for text-bearing leaf elements
      if (!EDITABLE_TAGS.has(descriptor.tagName)) return;

      // Ensure the element is selected first, then start editing
      setSelectedElement(descriptor);
      startEditing();
    },
    [active, iframeRef, setSelectedElement, startEditing]
  );

  // ── Hover highlight (lightweight — just cursor) ──
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!active) return;
      const overlay = overlayRef.current;
      if (!overlay) return;

      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument ?? iframe?.contentWindow?.document;
      if (!iframe || !doc) return;

      const el = resolveElementAtPoint(e.clientX, e.clientY, {
        iframe,
        doc,
      });

      overlay.style.cursor = el ? "pointer" : "default";
    },
    [active, iframeRef]
  );

  return (
    <div
      ref={overlayRef}
      className={cn(
        "absolute inset-0 z-10",
        !active && "pointer-events-none",
        className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseMove={handleMouseMove}
      aria-hidden="true"
    />
  );
}
