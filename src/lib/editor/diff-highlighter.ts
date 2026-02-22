/**
 * Diff highlighting utility for ZEST-015.
 *
 * After a successful refinement, `highlightChangedElements` diffs the previous
 * and updated HTML to find which elements changed, then applies a CSS animation
 * to them.
 */

/**
 * Parse HTML string into a lightweight map of element IDs → element (simplified).
 * Since we control generation and stamps each element with a data-zest-id,
 * we can match elements by their ID.
 */
function parseElements(html: string): Map<string, Element> {
  const map = new Map<string, Element>();
  const parser = new DOMParser();
  let doc: Document;

  try {
    doc = parser.parseFromString(html, "text/html");
  } catch {
    return map;
  }

  doc.querySelectorAll("[data-zest-id]").forEach((el) => {
    const id = el.getAttribute("data-zest-id");
    if (id) {
      map.set(id, el);
    }
  });

  return map;
}

/**
 * Compare two HTML documents and find which elements changed (by outerHTML).
 * Returns a set of data-zest-id values that are different between the two.
 */
function findChangedElementIds(prevHtml: string, nextHtml: string): Set<string> {
  const prevElements = parseElements(prevHtml);
  const nextElements = parseElements(nextHtml);
  const changed = new Set<string>();

  // Check for elements that exist in both but changed
  prevElements.forEach((prevEl, id) => {
    const nextEl = nextElements.get(id);
    if (nextEl && prevEl.outerHTML !== nextEl.outerHTML) {
      changed.add(id);
    }
  });

  // Check for newly added elements
  nextElements.forEach((_, id) => {
    if (!prevElements.has(id)) {
      changed.add(id);
    }
  });

  return changed;
}

/**
 * Apply a `data-zest-changed` attribute to elements that changed,
 * then trigger a CSS animation. The animation is defined in globals.css
 * as `@keyframes pulse-green` with a 1.5s duration.
 *
 * Returns the set of changed element IDs for logging/tracking.
 */
export function highlightChangedElements(
  prevHtml: string,
  nextHtml: string,
  iframeDocument: Document
): string[] {
  const changedIds = findChangedElementIds(prevHtml, nextHtml);
  const changedIdList = Array.from(changedIds);

  changedIds.forEach((id) => {
    const el = iframeDocument.querySelector(`[data-zest-id="${id}"]`);
    if (el instanceof HTMLElement) {
      el.setAttribute("data-zest-changed", "true");

      // Force animation restart by removing and re-adding class
      el.classList.remove("pulse-green");
      // Trigger reflow to ensure CSS animation restarts
      void el.offsetWidth;
      el.classList.add("pulse-green");

      // Remove the marker after animation completes (1500ms + buffer)
      setTimeout(() => {
        el.removeAttribute("data-zest-changed");
        el.classList.remove("pulse-green");
      }, 1600);
    }
  });

  return changedIdList;
}
