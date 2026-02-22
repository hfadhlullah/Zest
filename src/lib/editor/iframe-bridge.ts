/**
 * IframeBridge — same-origin iframe communication helper.
 *
 * MVP assumes same-origin iframe (FQ-03 from ZEST-009 story).
 * All methods access the iframe's contentDocument directly.
 * A postMessage fallback can be layered in later if cross-origin is needed.
 */

import type { ElementDescriptor, ElementRect } from "@/store/editor.store";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ZEST_ID_ATTR = "data-zest-id";
let _idCounter = 0;

function nextId(): string {
  return `zest-el-${++_idCounter}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the iframe's contentDocument, or null if unavailable.
 */
function getDoc(iframe: HTMLIFrameElement): Document | null {
  return iframe.contentDocument ?? iframe.contentWindow?.document ?? null;
}

/**
 * Ensures every element in the iframe document has a stable `data-zest-id`.
 * Runs on first access and is idempotent.
 */
export function stampIds(iframe: HTMLIFrameElement): void {
  const doc = getDoc(iframe);
  if (!doc) return;
  doc.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (!el.getAttribute(ZEST_ID_ATTR)) {
      el.setAttribute(ZEST_ID_ATTR, nextId());
    }
  });
}

/**
 * Retrieve an element from the iframe by its zest id.
 */
function getElementById(
  iframe: HTMLIFrameElement,
  id: string
): HTMLElement | null {
  const doc = getDoc(iframe);
  if (!doc) return null;
  return doc.querySelector<HTMLElement>(`[${ZEST_ID_ATTR}="${id}"]`);
}

// ---------------------------------------------------------------------------
// IframeBridge class
// ---------------------------------------------------------------------------

export class IframeBridge {
  private iframe: HTMLIFrameElement;

  constructor(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }

  /**
   * Returns the ElementDescriptor for the element at the given
   * coordinates (relative to the iframe's top-left corner in host page space).
   *
   * Returns null if the coordinate hits no element or only hits body/html.
   */
  getElementAt(x: number, y: number): ElementDescriptor | null {
    const doc = getDoc(this.iframe);
    if (!doc) return null;

    // elementFromPoint expects coords relative to the iframe's viewport
    const iframeRect = this.iframe.getBoundingClientRect();
    const relX = x - iframeRect.left;
    const relY = y - iframeRect.top;

    const el = doc.elementFromPoint(relX, relY) as HTMLElement | null;
    if (!el || el === doc.body || el === doc.documentElement) return null;

    // Ensure the element has a stable id
    if (!el.getAttribute(ZEST_ID_ATTR)) {
      el.setAttribute(ZEST_ID_ATTR, nextId());
    }

    return buildDescriptor(el, this.iframe);
  }

  /**
   * Apply CSS property changes to an element identified by its zest id.
   * Changes are applied inline on the element's style attribute.
   */
  applyStyle(elementId: string, styles: Partial<CSSStyleDeclaration>): void {
    const el = getElementById(this.iframe, elementId);
    if (!el) return;
    Object.entries(styles).forEach(([prop, value]) => {
      if (value !== undefined && value !== null) {
        // CSSStyleDeclaration properties are strings
        (el.style as unknown as Record<string, string>)[prop] = value as string;
      }
    });
  }

  /**
   * Get the current text content of an element.
   */
  getText(elementId: string): string {
    const el = getElementById(this.iframe, elementId);
    return el?.textContent?.trim() ?? "";
  }

  /**
   * Set the text content of an element.
   */
  setText(elementId: string, text: string): void {
    const el = getElementById(this.iframe, elementId);
    if (!el) return;
    // Only update if the element has no child elements (leaf text node)
    if (el.children.length === 0) {
      el.textContent = text;
    }
  }

  /**
   * Remove an element from the iframe DOM by its zest id.
   * Does nothing if the element is not found or is body/html.
   */
  removeElement(elementId: string): void {
    const el = getElementById(this.iframe, elementId);
    if (!el) return;
    const doc = getDoc(this.iframe);
    if (!doc) return;
    if (el === doc.body || el === doc.documentElement) return;
    el.parentNode?.removeChild(el);
  }

  /**
  serializeHtml(): string {
    const doc = getDoc(this.iframe);
    if (!doc) return "";
    return doc.body?.innerHTML ?? "";
  }

  /**
   * Re-stamp any elements that may have been added dynamically.
   */
  stampIds(): void {
    stampIds(this.iframe);
  }
}

// ---------------------------------------------------------------------------
// buildDescriptor helper
// ---------------------------------------------------------------------------

function buildDescriptor(
  el: HTMLElement,
  iframe: HTMLIFrameElement
): ElementDescriptor {
  const id = el.getAttribute(ZEST_ID_ATTR)!;
  const domRect = el.getBoundingClientRect();
  const iframeRect = iframe.getBoundingClientRect();

  // Rect relative to the iframe's viewport origin (for overlay positioning)
  const rect: ElementRect = {
    top: domRect.top - iframeRect.top,
    left: domRect.left - iframeRect.left,
    width: domRect.width,
    height: domRect.height,
  };

  // Snapshot a small set of visually relevant computed styles
  const computed = el.ownerDocument.defaultView?.getComputedStyle(el);
  const currentStyles: Partial<CSSStyleDeclaration> = computed
    ? {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        fontFamily: computed.fontFamily,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing,
        textAlign: computed.textAlign,
        padding: computed.padding,
        paddingTop: computed.paddingTop,
        paddingRight: computed.paddingRight,
        paddingBottom: computed.paddingBottom,
        paddingLeft: computed.paddingLeft,
        margin: computed.margin,
        marginTop: computed.marginTop,
        marginRight: computed.marginRight,
        marginBottom: computed.marginBottom,
        marginLeft: computed.marginLeft,
        borderRadius: computed.borderRadius,
        border: computed.border,
        display: computed.display,
        flexDirection: computed.flexDirection,
        alignItems: computed.alignItems,
        justifyContent: computed.justifyContent,
        gap: computed.gap,
        width: computed.width,
        height: computed.height,
      }
    : {};

  return {
    id,
    tagName: el.tagName.toLowerCase(),
    rect,
    currentStyles,
    textContent: el.textContent?.trim() ?? "",
  };
}
