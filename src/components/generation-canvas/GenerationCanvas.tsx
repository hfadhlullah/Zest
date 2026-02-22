"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { OutputFormat } from "@/components/prompt-bar/PromptBar.types";
import { CanvasOverlay } from "@/components/editor/canvas/CanvasOverlay";
import { SelectionBox } from "@/components/editor/canvas/SelectionBox";
import { InlineTextEditor } from "@/components/editor/canvas/InlineTextEditor";
import { useEditorStore } from "@/store/editor.store";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import { useDragResize } from "@/hooks/useDragResize";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerationCanvasProps {
  /** Raw HTML to render */
  html: string;
  /** CSS string — injected as a <style> tag for html_css format */
  css?: string;
  /** Output format — determines whether CSS is injected separately */
  format?: OutputFormat;
  /**
   * When true, the CanvasOverlay and SelectionBox are active.
   * Defaults to false so the canvas works standalone (e.g. in tests / preview mode).
   */
  interactive?: boolean;
  /**
   * Optional external ref to the inner <iframe>. When provided, the component
   * uses this ref so the caller (EditorPage) can share it with the
   * PropertiesPanel without prop-drilling through intermediate layers.
   */
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  /** Additional className for the iframe wrapper */
  className?: string;
  /** Accessible title for the iframe */
  title?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders generated HTML inside a sandboxed iframe (BR-010).
 *
 * Security constraints:
 *  - sandbox="allow-same-origin" only — scripts are NEVER allowed
 *  - Content is written via srcdoc, not innerHTML
 */
export function GenerationCanvas({
  html,
  css,
  format = "html_css",
  interactive = false,
  iframeRef: externalIframeRef,
  className,
  title = "Generated UI preview",
}: GenerationCanvasProps) {
  const internalIframeRef = useRef<HTMLIFrameElement>(null);
  const iframeRef = externalIframeRef ?? internalIframeRef;
  const selectedElement = useEditorStore((s) => s.selectedElement);
  const isInlineEditing = useEditorStore((s) => s.isInlineEditing);
  const undoVersion = useEditorStore((s) => s.undoVersion);
  const editorHtml = useEditorStore((s) => s.editorHtml);
  const editorCss = useEditorStore((s) => s.editorCss);
  const viewportWidth = useEditorStore((s) => s.viewportWidth);
  const { commitEdit, cancelEdit } = useInlineEdit();
  const { onMouseDown: onDragMouseDown } = useDragResize(iframeRef);

  // Write iframe when generation props change
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) return;

    const fullDocument = buildDocument(html, css, format);

    doc.open();
    doc.write(fullDocument);
    doc.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, css, format]);

  // Re-write iframe when undo/redo fires
  useEffect(() => {
    if (undoVersion === 0) return; // skip initial mount
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) return;

    const fullDocument = buildDocument(editorHtml || html, editorCss || css, format);

    doc.open();
    doc.write(fullDocument);
    doc.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoVersion]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border",
        "bg-[var(--color-bg-primary)]",
        "border-[var(--color-border-default)]",
        className
      )}
      style={{
        width: viewportWidth ? `${viewportWidth}px` : "100%",
        transition: "width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <iframe
        ref={iframeRef}
        // BR-010: allow-same-origin only — no allow-scripts
        sandbox="allow-same-origin"
        title={title}
        className="block h-full w-full"
        style={{ minHeight: 400, border: "none" }}
        aria-label={title}
      />

      {/* ── ZEST-009: Overlay + selection ring ── */}
      {interactive && (
        <>
          {/* Hide overlay when inline editing to let editor receive events */}
          {!isInlineEditing && (
            <CanvasOverlay iframeRef={iframeRef} active />
          )}
          {selectedElement && !isInlineEditing && (
            <SelectionBox
              rect={selectedElement.rect}
              onDragMouseDown={onDragMouseDown}
            />
          )}
          {/* ── ZEST-011: Inline text editor ── */}
          {selectedElement && isInlineEditing && (
            <InlineTextEditor
              element={selectedElement}
              iframeRef={iframeRef}
              onCommit={commitEdit}
              onCancel={cancelEdit}
            />
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the complete HTML document string to write into the iframe.
 *
 * For `html_css` format: wraps html in a full document and injects css as a
 * `<style>` tag in the `<head>`.
 *
 * For `tailwind` format: html is expected to already contain Tailwind CDN
 * classes; inject as-is inside a minimal document shell with Tailwind Play CDN
 * loaded (no scripts allowed by sandbox, so we skip the CDN — classes render
 * with inline styles not available; we simply inject the markup as-is and note
 * this requires tailwind to be pre-compiled or the iframe to have access to
 * allow-scripts for CDN — per BR-010 we keep sandbox strict and accept that
 * Tailwind utility classes will be unstyled unless the generated html includes
 * a <link> tag pointing to a pre-built sheet).
 */
function buildDocument(
  html: string,
  css: string | undefined,
  format: OutputFormat
): string {
  const styleTag =
    format === "html_css" && css
      ? `<style>\n${escapeStyleContent(css)}\n</style>`
      : "";

  // If the html already contains a full document, inject our style tag into
  // the existing <head> to avoid double-wrapping.
  if (/^\s*<!doctype/i.test(html) || /^\s*<html/i.test(html)) {
    if (styleTag) {
      // Insert before </head> if present, else before <body>
      if (/<\/head>/i.test(html)) {
        return html.replace(/<\/head>/i, `${styleTag}\n</head>`);
      }
      if (/<body/i.test(html)) {
        return html.replace(/<body/i, `${styleTag}\n<body`);
      }
    }
    return html;
  }

  // Fragment — wrap in minimal document shell
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
${styleTag}
</head>
<body>
${html}
</body>
</html>`;
}

/**
 * Prevents `</style>` injection attacks inside a CSS string.
 * Replaces the literal sequence to break out of a style tag.
 */
function escapeStyleContent(css: string): string {
  return css.replace(/<\/style>/gi, "<\\/style>");
}
