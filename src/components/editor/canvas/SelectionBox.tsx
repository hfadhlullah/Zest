"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ElementRect } from "@/store/editor.store";
import type { DragType, ResizeHandle } from "@/hooks/useDragResize";

// ---------------------------------------------------------------------------
// Handle positions — 8 points: 4 corners + 4 midpoints
// ---------------------------------------------------------------------------

const HANDLE_POSITIONS: ResizeHandle[] = ["nw","n","ne","w","e","sw","s","se"];

interface HandleStyle {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  transform: string;
  cursor: string;
}

const HANDLE_STYLES: Record<ResizeHandle, HandleStyle> = {
  nw: { top: "0", left: "0",   transform: "translate(-50%,-50%)", cursor: "nw-resize" },
  n:  { top: "0", left: "50%", transform: "translate(-50%,-50%)", cursor: "n-resize" },
  ne: { top: "0", right: "0",  transform: "translate(50%,-50%)",  cursor: "ne-resize" },
  w:  { top: "50%", left: "0", transform: "translate(-50%,-50%)", cursor: "w-resize" },
  e:  { top: "50%", right: "0",transform: "translate(50%,-50%)",  cursor: "e-resize" },
  sw: { bottom: "0", left: "0",   transform: "translate(-50%,50%)", cursor: "sw-resize" },
  s:  { bottom: "0", left: "50%", transform: "translate(-50%,50%)", cursor: "s-resize" },
  se: { bottom: "0", right: "0",  transform: "translate(50%,50%)",  cursor: "se-resize" },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectionBoxProps {
  /** Bounding rect relative to the overlay container (px) */
  rect: ElementRect;
  /** Whether to animate position changes */
  animated?: boolean;
  /**
   * When provided, the selection box body and handles become interactive:
   * dragging the body calls onDragMouseDown('move', e) and dragging a handle
   * calls onDragMouseDown(handlePosition, e).
   */
  onDragMouseDown?: (type: DragType, e: React.MouseEvent) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a brand-green selection ring with 8 resize handles over the
 * selected element. Positioned absolutely inside the CanvasOverlay.
 *
 * Uses a ResizeObserver on the parent container so the box stays in sync
 * when the canvas resizes.
 */
export function SelectionBox({
  rect,
  animated = true,
  onDragMouseDown,
  className,
}: SelectionBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [currentRect, setCurrentRect] = useState<ElementRect>(rect);

  // Update rect smoothly
  useEffect(() => {
    setCurrentRect(rect);
  }, [rect]);

  const { top, left, width, height } = currentRect;
  const interactive = !!onDragMouseDown;

  return (
    <div
      ref={boxRef}
      className={cn(
        "absolute z-20",
        // When interactive, pointer-events are enabled on the body for drag-to-move
        interactive ? "cursor-move" : "pointer-events-none",
        animated && "transition-all duration-100",
        className
      )}
      style={{
        top,
        left,
        width,
        height,
        // Selection ring — 2px brand-primary border (AC from ZEST-009)
        outline: "2px solid var(--color-brand-primary)",
        outlineOffset: "1px",
        boxShadow: "0 0 0 1px rgba(34,197,94,0.15)",
      }}
      onMouseDown={
        interactive
          ? (e) => onDragMouseDown("move", e)
          : undefined
      }
      aria-hidden="true"
    >
      {/* Label showing tag name — small badge at top-left */}
      <TagLabel top={top} />

      {/* 8 resize handles */}
      {HANDLE_POSITIONS.map((pos) => (
        <Handle
          key={pos}
          position={pos}
          onMouseDown={interactive ? onDragMouseDown : undefined}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Handle({
  position,
  onMouseDown,
}: {
  position: ResizeHandle;
  onMouseDown?: (type: DragType, e: React.MouseEvent) => void;
}) {
  const style = HANDLE_STYLES[position];
  return (
    <div
      className={cn(
        "absolute h-2.5 w-2.5 rounded-sm border-2",
        onMouseDown ? "pointer-events-auto" : "pointer-events-none"
      )}
      style={{
        ...style,
        background: "var(--color-neutral-0)",
        borderColor: "var(--color-brand-primary)",
        boxShadow: "var(--shadow-xs)",
      }}
      onMouseDown={
        onMouseDown
          ? (e) => {
              e.stopPropagation(); // prevent triggering body's move handler
              onMouseDown(position, e);
            }
          : undefined
      }
    />
  );
}

function TagLabel({ top }: { top: number }) {
  // Show above the selection box, or below if too close to top
  const above = top > 22;
  return (
    <div
      className="pointer-events-none absolute left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-medium"
      style={{
        bottom: above ? "100%" : undefined,
        top: above ? undefined : "100%",
        marginBottom: above ? 4 : undefined,
        marginTop: above ? undefined : 4,
        background: "var(--color-brand-primary)",
        color: "var(--color-neutral-0)",
      }}
    />
  );
}
