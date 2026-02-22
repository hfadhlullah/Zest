/**
 * element-resolver.ts
 *
 * Pure utility functions for mapping host-page pointer coordinates to
 * iframe DOM elements. Separated from IframeBridge so it can be unit-tested
 * with a mock Document without needing a real iframe.
 */

import type { ElementDescriptor, ElementRect } from "@/store/editor.store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResolverContext {
  /** The iframe element in the host page */
  iframe: HTMLIFrameElement;
  /** The iframe's content document */
  doc: Document;
}

// ---------------------------------------------------------------------------
// Selectable element check
// ---------------------------------------------------------------------------

/**
 * Returns true if the element should be selectable.
 * We exclude `<html>` and `<body>` — clicking "outside" any real element
 * should deselect rather than select the root.
 */
export function isSelectable(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  return tag !== "html" && tag !== "body";
}

// ---------------------------------------------------------------------------
// Coordinate resolution
// ---------------------------------------------------------------------------

/**
 * Given a pointer event's clientX/clientY in the **host page** coordinate
 * space and a ResolverContext, returns the innermost selectable element
 * at that point inside the iframe, or null.
 *
 * Uses elementFromPoint() on the iframe's document with coordinates
 * translated to the iframe's viewport space.
 */
export function resolveElementAtPoint(
  clientX: number,
  clientY: number,
  ctx: ResolverContext
): HTMLElement | null {
  const iframeRect = ctx.iframe.getBoundingClientRect();
  const relX = clientX - iframeRect.left;
  const relY = clientY - iframeRect.top;

  // Out-of-bounds check
  if (
    relX < 0 ||
    relY < 0 ||
    relX > iframeRect.width ||
    relY > iframeRect.height
  ) {
    return null;
  }

  const el = ctx.doc.elementFromPoint(relX, relY) as HTMLElement | null;
  if (!el || !isSelectable(el)) return null;
  return el;
}

// ---------------------------------------------------------------------------
// Bounding rect calculation
// ---------------------------------------------------------------------------

/**
 * Returns the element's bounding rect translated so that (0,0) is the
 * top-left of the iframe element in the host page — i.e. the coordinate
 * system used by the CanvasOverlay.
 */
export function getElementRectInOverlay(
  el: HTMLElement,
  iframe: HTMLIFrameElement
): ElementRect {
  const domRect = el.getBoundingClientRect();
  const iframeRect = iframe.getBoundingClientRect();
  return {
    top: domRect.top - iframeRect.top,
    left: domRect.left - iframeRect.left,
    width: domRect.width,
    height: domRect.height,
  };
}

// ---------------------------------------------------------------------------
// Style snapshot
// ---------------------------------------------------------------------------

const STYLE_KEYS: Array<keyof CSSStyleDeclaration> = [
  "color",
  "backgroundColor",
  "fontSize",
  "fontWeight",
  "fontFamily",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "borderRadius",
  "border",
  "display",
  "flexDirection",
  "alignItems",
  "justifyContent",
  "gap",
  "width",
  "height",
];

export function snapshotStyles(
  el: HTMLElement
): Partial<CSSStyleDeclaration> {
  const win = el.ownerDocument.defaultView;
  if (!win) return {};
  const computed = win.getComputedStyle(el);
  const result: Partial<CSSStyleDeclaration> = {};
  for (const key of STYLE_KEYS) {
    // CSSStyleDeclaration numeric index access vs string keys
    const val = computed[key as unknown as number];
    if (val !== undefined) {
      (result as Record<string, unknown>)[key as string] = val;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Build full descriptor from an HTMLElement
// ---------------------------------------------------------------------------

const ZEST_ID_ATTR = "data-zest-id";
let _counter = 0;

export function ensureZestId(el: HTMLElement): string {
  let id = el.getAttribute(ZEST_ID_ATTR);
  if (!id) {
    id = `zest-el-${++_counter}`;
    el.setAttribute(ZEST_ID_ATTR, id);
  }
  return id;
}

export function buildElementDescriptor(
  el: HTMLElement,
  iframe: HTMLIFrameElement
): ElementDescriptor {
  return {
    id: ensureZestId(el),
    tagName: el.tagName.toLowerCase(),
    rect: getElementRectInOverlay(el, iframe),
    currentStyles: snapshotStyles(el),
    textContent: el.textContent?.trim() ?? "",
  };
}
