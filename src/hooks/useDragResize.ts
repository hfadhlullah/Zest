"use client";

import { useCallback, useRef } from "react";
import { useEditorStore } from "@/store/editor.store";
import { IframeBridge } from "@/lib/editor/iframe-bridge";
import { buildElementDescriptor } from "@/lib/editor/element-resolver";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ResizeHandle =
  | "nw" | "n" | "ne"
  | "w"        | "e"
  | "sw" | "s" | "se";

export type DragType = "move" | ResizeHandle;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function px(n: number): string {
  return `${Math.round(n)}px`;
}

/** Ensure element is positioned so left/top work */
function ensurePositioned(el: HTMLElement): void {
  const pos = el.ownerDocument.defaultView?.getComputedStyle(el).position ?? "static";
  if (pos === "static") {
    el.style.position = "relative";
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provides `onMouseDown` handlers for drag-to-move and resize handles on the
 * SelectionBox. All mutations go through IframeBridge so they are applied
 * directly to the iframe's DOM elements.
 *
 * @param iframeRef  Ref to the canvas iframe
 */
export function useDragResize(
  iframeRef: React.RefObject<HTMLIFrameElement | null>
) {
  const {
    selectedElement,
    setSelectedElement,
    pushHistory,
    editorHtml,
    editorCss,
  } = useEditorStore();

  // Capture drag start state in a ref to avoid stale closure issues
  const dragRef = useRef<{
    type: DragType;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    startWidth: number;
    startHeight: number;
    elementId: string;
  } | null>(null);

  const onMouseDown = useCallback(
    (type: DragType, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const iframe = iframeRef.current;
      if (!iframe || !selectedElement) return;

      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!doc) return;

      const el = doc.querySelector<HTMLElement>(
        `[data-zest-id="${selectedElement.id}"]`
      );
      if (!el) return;

      // Ensure element can be positioned
      ensurePositioned(el);

      const computed = el.ownerDocument.defaultView?.getComputedStyle(el);
      const startLeft = parseFloat(computed?.left ?? "0") || 0;
      const startTop = parseFloat(computed?.top ?? "0") || 0;
      const startWidth = parseFloat(computed?.width ?? "0") || el.offsetWidth;
      const startHeight = parseFloat(computed?.height ?? "0") || el.offsetHeight;

      dragRef.current = {
        type,
        startX: e.clientX,
        startY: e.clientY,
        startLeft,
        startTop,
        startWidth,
        startHeight,
        elementId: selectedElement.id,
      };

      function onMouseMove(ev: MouseEvent) {
        const d = dragRef.current;
        if (!d) return;
        const iframe2 = iframeRef.current;
        if (!iframe2) return;

        const dx = ev.clientX - d.startX;
        const dy = ev.clientY - d.startY;
        const bridge = new IframeBridge(iframe2);

        if (d.type === "move") {
          bridge.applyStyle(d.elementId, {
            left: px(d.startLeft + dx),
            top: px(d.startTop + dy),
          } as Partial<CSSStyleDeclaration>);
        } else {
          // Resize
          let newLeft = d.startLeft;
          let newTop = d.startTop;
          let newWidth = d.startWidth;
          let newHeight = d.startHeight;

          const h = d.type;

          // Horizontal
          if (h === "w" || h === "nw" || h === "sw") {
            newWidth = Math.max(20, d.startWidth - dx);
            newLeft = d.startLeft + (d.startWidth - newWidth);
          } else if (h === "e" || h === "ne" || h === "se") {
            newWidth = Math.max(20, d.startWidth + dx);
          }

          // Vertical
          if (h === "n" || h === "nw" || h === "ne") {
            newHeight = Math.max(20, d.startHeight - dy);
            newTop = d.startTop + (d.startHeight - newHeight);
          } else if (h === "s" || h === "sw" || h === "se") {
            newHeight = Math.max(20, d.startHeight + dy);
          }

          bridge.applyStyle(d.elementId, {
            left: px(newLeft),
            top: px(newTop),
            width: px(newWidth),
            height: px(newHeight),
          } as Partial<CSSStyleDeclaration>);
        }

        // Re-snapshot element descriptor so SelectionBox updates
        const doc2 = iframe2.contentDocument ?? iframe2.contentWindow?.document;
        if (doc2) {
          const el2 = doc2.querySelector<HTMLElement>(
            `[data-zest-id="${d.elementId}"]`
          );
          if (el2) {
            const updated = buildElementDescriptor(el2, iframe2);
            setSelectedElement(updated);
          }
        }
      }

      function onMouseUp() {
        if (dragRef.current) {
          pushHistory(editorHtml, editorCss);
          dragRef.current = null;
        }
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [iframeRef, selectedElement, setSelectedElement, pushHistory, editorHtml, editorCss]
  );

  return { onMouseDown };
}
