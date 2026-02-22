"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditorStore } from "@/store/editor.store";
import { stampIds } from "@/lib/editor/iframe-bridge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LayerNode {
  id: string;
  tagName: string;
  /** Truncated text label (max 24 chars) */
  label: string;
  depth: number;
  children: LayerNode[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Tags to skip when building the layer tree (non-visual / meta) */
const SKIP_TAGS = new Set([
  "head", "meta", "title", "link", "script", "style", "noscript",
]);

/** Maximum nesting depth to traverse */
const MAX_DEPTH = 8;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildTree(
  el: Element,
  iframe: HTMLIFrameElement,
  depth: number
): LayerNode | null {
  const tag = el.tagName.toLowerCase();
  if (SKIP_TAGS.has(tag)) return null;
  if (depth > MAX_DEPTH) return null;

  const id = el.getAttribute("data-zest-id") ?? "";
  if (!id) return null;

  // Build a label: text content snippet or tag
  const rawText = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent?.trim() ?? "")
    .join(" ")
    .trim();

  const label = rawText.length > 0
    ? rawText.slice(0, 24) + (rawText.length > 24 ? "…" : "")
    : tag;

  const children: LayerNode[] = [];
  for (const child of Array.from(el.children)) {
    const node = buildTree(child, iframe, depth + 1);
    if (node) children.push(node);
  }

  return { id, tagName: tag, label, depth, children };
}

function flattenTree(nodes: LayerNode[]): LayerNode[] {
  const result: LayerNode[] = [];
  for (const node of nodes) {
    result.push(node);
    result.push(...flattenTree(node.children));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLayerTree(
  iframeRef: React.RefObject<HTMLIFrameElement | null>
) {
  const [layers, setLayers] = useState<LayerNode[]>([]);
  const selectedElement = useEditorStore((s) => s.selectedElement);

  const refresh = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc || !doc.body) return;

    // Stamp any un-stamped elements before traversal
    stampIds(iframe);

    const rootNodes: LayerNode[] = [];
    for (const child of Array.from(doc.body.children)) {
      const node = buildTree(child, iframe, 0);
      if (node) rootNodes.push(node);
    }

    setLayers(flattenTree(rootNodes));
  }, [iframeRef]);

  // Refresh when the iframe loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    function handleLoad() {
      refresh();
    }
    iframe.addEventListener("load", handleLoad);
    if (iframe.contentDocument?.readyState === "complete") {
      refresh();
    }
    return () => iframe.removeEventListener("load", handleLoad);
  }, [iframeRef, refresh]);

  // Also refresh when selected element changes (content may have changed)
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElement]);

  return { layers, refresh };
}
