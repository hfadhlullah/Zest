"use client";

import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor.store";
import { useLayerTree } from "@/hooks/useLayerTree";
import { IframeBridge } from "@/lib/editor/iframe-bridge";
import { buildElementDescriptor } from "@/lib/editor/element-resolver";
import type { LayerNode } from "@/hooks/useLayerTree";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LayersPanelProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

// ---------------------------------------------------------------------------
// Tag icon
// ---------------------------------------------------------------------------

function TagIcon({ tagName }: { tagName: string }) {
  // Simple colour coding by element family
  const color =
    tagName.startsWith("h") && tagName.length === 2
      ? "var(--color-brand-primary)"
      : ["p", "span", "a", "label"].includes(tagName)
      ? "var(--color-info)"
      : ["div", "section", "article", "main", "header", "footer", "nav"].includes(tagName)
      ? "var(--color-text-secondary)"
      : ["button", "input", "select", "textarea"].includes(tagName)
      ? "var(--color-warning)"
      : ["img", "video", "canvas", "svg"].includes(tagName)
      ? "var(--color-error)"
      : "var(--color-text-muted)";

  return (
    <div
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-xs font-bold"
      style={{ color, fontSize: 9, fontFamily: "var(--font-mono)" }}
      aria-hidden="true"
    >
      {tagName.slice(0, 2)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layer row
// ---------------------------------------------------------------------------

function LayerRow({
  node,
  isSelected,
  onClick,
}: {
  node: LayerNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs transition-colors",
        isSelected
          ? "font-medium"
          : "hover:bg-[var(--color-bg-hover)]"
      )}
      style={{
        paddingLeft: `${8 + node.depth * 12}px`,
        background: isSelected ? "var(--color-brand-primary-light)" : undefined,
        color: isSelected ? "var(--color-brand-primary)" : "var(--color-text-secondary)",
      }}
      title={`<${node.tagName}> ${node.label}`}
    >
      <TagIcon tagName={node.tagName} />
      <span className="min-w-0 truncate">{node.label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyLayers() {
  return (
    <div
      className="flex flex-col items-center gap-2 px-4 py-8 text-center"
      style={{ color: "var(--color-text-muted)" }}
    >
      <p className="text-xs leading-relaxed">
        Generate a UI to see layers here.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LayersPanel({ iframeRef }: LayersPanelProps) {
  const { layers } = useLayerTree(iframeRef);
  const { selectedElement, setSelectedElement } = useEditorStore();

  function handleSelect(node: LayerNode) {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument ?? iframe?.contentWindow?.document;
    if (!iframe || !doc) return;

    const el = doc.querySelector<HTMLElement>(`[data-zest-id="${node.id}"]`);
    if (!el) return;

    const descriptor = buildElementDescriptor(el, iframe);
    setSelectedElement(descriptor);
  }

  if (layers.length === 0) return <EmptyLayers />;

  return (
    <div className="flex flex-col gap-0.5 py-1">
      {layers.map((node) => (
        <LayerRow
          key={node.id}
          node={node}
          isSelected={selectedElement?.id === node.id}
          onClick={() => handleSelect(node)}
        />
      ))}
    </div>
  );
}
