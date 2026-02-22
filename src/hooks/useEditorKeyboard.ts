"use client";

import { useCallback, useEffect } from "react";
import { useEditorStore } from "@/store/editor.store";
import { IframeBridge } from "@/lib/editor/iframe-bridge";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Registers global keyboard shortcuts for the editor:
 *
 * - Delete / Backspace   → remove selected element
 * - Cmd/Ctrl + Z         → undo
 * - Cmd/Ctrl + Shift + Z → redo
 * - Cmd/Ctrl + Y         → redo (Windows alternative)
 *
 * Must be mounted only when the editor is active (inside EditorPage).
 *
 * @param iframeRef  Ref to the canvas iframe (needed for delete + undo/redo DOM sync)
 */
export function useEditorKeyboard(
  iframeRef: React.RefObject<HTMLIFrameElement | null>
) {
  const {
    selectedElement,
    setSelectedElement,
    isInlineEditing,
    undo,
    redo,
    undoStack,
    redoStack,
    pushHistory,
    editorHtml,
    editorCss,
  } = useEditorStore();

  const handleDelete = useCallback(() => {
    if (isInlineEditing) return; // don't delete while typing
    if (!selectedElement) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Push to history before deleting
    pushHistory(editorHtml, editorCss);

    const bridge = new IframeBridge(iframe);
    bridge.removeElement(selectedElement.id);
    setSelectedElement(null);
  }, [
    isInlineEditing,
    selectedElement,
    iframeRef,
    pushHistory,
    editorHtml,
    editorCss,
    setSelectedElement,
  ]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    undo();
    // After undo, the editorHtml/editorCss in the store is updated.
    // The iframe is re-written in GenerationCanvas via useEffect on those values
    // (wired below via the store subscription pattern).
  }, [undo, undoStack.length]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    redo();
  }, [redo, redoStack.length]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Skip if an input / contenteditable is focused
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isInputFocused) return;

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (isMod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleDelete, handleUndo, handleRedo]);
}
