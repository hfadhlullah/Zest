"use client";

import { useCallback, useRef } from "react";
import { useEditorStore } from "@/store/editor.store";
import { IframeBridge } from "@/lib/editor/iframe-bridge";
import { buildElementDescriptor } from "@/lib/editor/element-resolver";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UsePropertyEditReturn {
  /** Apply a CSS property change immediately to the iframe element */
  applyStyle: (prop: string, value: string) => void;
  /** Current computed styles of the selected element */
  currentStyles: Partial<CSSStyleDeclaration>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provides live style editing for the currently selected element.
 *
 * - Changes are applied immediately via IframeBridge (<50ms AC)
 * - Changes are debounced 300ms before being pushed onto the undo stack (BR-018)
 *
 * @param iframeRef - ref to the canvas iframe
 */
export function usePropertyEdit(
  iframeRef: React.RefObject<HTMLIFrameElement | null>
): UsePropertyEditReturn {
  const { selectedElement, setSelectedElement, pushHistory, editorHtml, editorCss } =
    useEditorStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyStyle = useCallback(
    (prop: string, value: string) => {
      const iframe = iframeRef.current;
      if (!iframe || !selectedElement) return;

      const bridge = new IframeBridge(iframe);

      // Apply immediately
      bridge.applyStyle(selectedElement.id, {
        [prop]: value,
      } as Partial<CSSStyleDeclaration>);

      // Re-snapshot the element's styles so the panel stays in sync
      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (doc) {
        const el = doc.querySelector<HTMLElement>(
          `[data-zest-id="${selectedElement.id}"]`
        );
        if (el) {
          const updated = buildElementDescriptor(el, iframe);
          setSelectedElement(updated);
        }
      }

      // Debounce the undo push so rapid slider/input changes don't flood history
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        pushHistory(editorHtml, editorCss);
      }, 300);
    },
    [iframeRef, selectedElement, setSelectedElement, pushHistory, editorHtml, editorCss]
  );

  return {
    applyStyle,
    currentStyles: selectedElement?.currentStyles ?? {},
  };
}
