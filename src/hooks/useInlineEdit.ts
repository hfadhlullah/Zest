"use client";

import { useCallback } from "react";
import { useEditorStore } from "@/store/editor.store";
import { IframeBridge } from "@/lib/editor/iframe-bridge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseInlineEditReturn {
  /** Whether inline text editing is currently active for the selected element */
  isEditing: boolean;
  /** Activate editing — call on double-click of a selected text element */
  startEditing: () => void;
  /**
   * Commit the edited text to the iframe element and deactivate editing.
   * @param iframeRef  Ref to the canvas iframe
   * @param text       Final text content to write
   */
  commitEdit: (
    iframeRef: React.RefObject<HTMLIFrameElement | null>,
    text: string
  ) => void;
  /** Cancel editing without committing any change */
  cancelEdit: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useInlineEdit(): UseInlineEditReturn {
  const {
    selectedElement,
    isInlineEditing,
    setInlineEditing,
    pushHistory,
    editorHtml,
    editorCss,
  } = useEditorStore();

  const startEditing = useCallback(() => {
    if (!selectedElement) return;
    setInlineEditing(true);
  }, [selectedElement, setInlineEditing]);

  const commitEdit = useCallback(
    (iframeRef: React.RefObject<HTMLIFrameElement | null>, text: string) => {
      const iframe = iframeRef.current;
      if (iframe && selectedElement) {
        const bridge = new IframeBridge(iframe);
        bridge.setText(selectedElement.id, text);
        pushHistory(editorHtml, editorCss);
      }
      setInlineEditing(false);
    },
    [selectedElement, setInlineEditing, pushHistory, editorHtml, editorCss]
  );

  const cancelEdit = useCallback(() => {
    setInlineEditing(false);
  }, [setInlineEditing]);

  return {
    isEditing: isInlineEditing,
    startEditing,
    commitEdit,
    cancelEdit,
  };
}
