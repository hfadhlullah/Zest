"use client";

import { useCallback, useState } from "react";
import { randomUUID } from "crypto";
import { useEditorStore } from "@/store/editor.store";
import { useGenerationStore } from "@/store/generation.store";
import { highlightChangedElements } from "@/lib/editor/diff-highlighter";
import type { ChatMessage } from "@/store/editor.store";

export interface UseRefinementOptions {
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
}

export function useRefinement(options?: UseRefinementOptions) {
  const [isRefining, setIsRefining] = useState(false);
  const {
    editorHtml,
    editorCss,
    appendChatMessage,
    setEditorHtml,
    setEditorCss,
    pushHistory,
  } = useEditorStore();
  const { result: generation, format } = useGenerationStore();

  const refine = useCallback(
    async (message: string) => {
      if (!generation) {
        console.error("[useRefinement] No active generation");
        return;
      }

      setIsRefining(true);

      // Add user message to chat
      appendChatMessage({
        id: randomUUID(),
        role: "user",
        content: message,
        timestamp: new Date(),
      });

      try {
        // Call /api/v1/generate with refinement context (ZEST-014)
         const response = await fetch("/api/v1/generate", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             prompt: message,
             output_format: format || "html_css",
             previous_generation_id: generation.generation_id,
             previous_html: editorHtml || generation.html,
             previous_css: editorCss || generation.css,
           }),
         });

        if (!response.ok) {
          const apiError = await response.json().catch(() => null);
          const errorMsg = apiError?.error?.message ?? "Refinement failed";

          appendChatMessage({
            id: randomUUID(),
            role: "ai",
            content: errorMsg,
            timestamp: new Date(),
            error: errorMsg,
          });
          return;
        }

        const json = await response.json();
        const newGeneration = json.data;

        // Update canvas with new HTML/CSS
        pushHistory(editorHtml || generation.html, editorCss || generation.css);
        setEditorHtml(newGeneration.html);
        setEditorCss(newGeneration.css || "");

        // Highlight changed elements in the iframe
        const changedIds: string[] = [];
        const iframe = options?.iframeRef?.current;
        if (iframe?.contentDocument) {
          const prevHtml = editorHtml || generation.html;
          const changed = highlightChangedElements(
            prevHtml,
            newGeneration.html,
            iframe.contentDocument
          );
          changedIds.push(...changed);
        }

        // Add success message to chat
        appendChatMessage({
          id: randomUUID(),
          role: "ai",
          content: `Updated. ${changedIds.length > 0 ? `${changedIds.length} elements changed.` : ""}`,
          timestamp: new Date(),
          changedElements: changedIds,
        });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An unexpected error occurred";

        appendChatMessage({
          id: randomUUID(),
          role: "ai",
          content: errorMsg,
          timestamp: new Date(),
          error: errorMsg,
        });
      } finally {
        setIsRefining(false);
      }
    },
    [
      generation,
      format,
      editorHtml,
      editorCss,
      appendChatMessage,
      setEditorHtml,
      setEditorCss,
      pushHistory,
      options?.iframeRef,
    ]
  );

  return { refine, isRefining };
}
