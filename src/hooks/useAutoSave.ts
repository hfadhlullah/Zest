"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editor.store";
import { useGenerationStore } from "@/store/generation.store";
import { useProjectStore } from "@/store/project.store";

export interface UseAutoSaveOptions {
  /** Interval in milliseconds (default: 5000) */
  interval?: number;
  /** Enabled by default */
  enabled?: boolean;
}

/**
 * Auto-saves the current generation to the project at regular intervals.
 * Saves when:
 * 1. Editor content changes (HTML/CSS)
 * 2. Interval elapses without a save
 *
 * @param options Configuration for auto-save behavior
 */
export function useAutoSave(options?: UseAutoSaveOptions) {
  const { interval = 5000, enabled = true } = options ?? {};

  const { editorHtml, editorCss } = useEditorStore();
  const { result: generation } = useGenerationStore();
  const { currentProject, setSaving, setSaveError, setLastSavedAt } =
    useProjectStore();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentHashRef = useRef<string>("");

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Trigger auto-save when content changes or interval elapses
  useEffect(() => {
    if (!enabled || !currentProject || !generation) {
      return;
    }

    // Create hash of current content to detect changes
    const currentHash = JSON.stringify({ editorHtml, editorCss });

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if content actually changed
    const hasContentChanged = currentHash !== contentHashRef.current;

    // Schedule save if content changed or after interval
    if (hasContentChanged || !contentHashRef.current) {
      contentHashRef.current = currentHash;

      timeoutRef.current = setTimeout(async () => {
        await performAutoSave();
      }, interval);
    }
  }, [editorHtml, editorCss, enabled, currentProject, generation, interval]);

  const performAutoSave = async () => {
    if (!currentProject || !generation) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      // Update project with latest generation ID
      const res = await fetch(`/api/v1/projects/${currentProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latest_generation_id: generation.generation_id,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to auto-save");
      }

      setLastSavedAt(new Date());
      console.log("[AutoSave] Project saved successfully");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Auto-save failed";
      setSaveError(errorMsg);
      console.error("[AutoSave] Error:", errorMsg);
    } finally {
      setSaving(false);
    }
  };
}
