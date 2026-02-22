import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Bounding rect of a selected element — mirrors DOMRect but plain object
 * so it is serialisable into Zustand without issues.
 */
export interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Full description of the currently selected element inside the iframe.
 */
export interface ElementDescriptor {
  /** Stable synthetic id injected into the iframe DOM (data-zest-id) */
  id: string;
  /** Lower-case tag name, e.g. "div", "h1", "button" */
  tagName: string;
  /** Bounding rect relative to the iframe's content document */
  rect: ElementRect;
  /** Computed styles at the time of selection */
  currentStyles: Partial<CSSStyleDeclaration>;
  /** Visible text content (trimmed) */
  textContent: string;
}

export interface HistoryEntry {
  html: string;
  css: string;
}

/**
 * Message in the chat thread (ZEST-015).
 */
export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  /** When role === "ai" and refinement succeeded, list of element IDs that changed */
  changedElements?: string[];
  /** When role === "ai" and refinement failed, the error message */
  error?: string;
}

export interface EditorState {
  /** Currently selected element, or null when nothing is selected */
  selectedElement: ElementDescriptor | null;
  /** Whether the inline text editor is active for the selected element */
  isInlineEditing: boolean;
  /** The live HTML in the editor canvas (may differ from generation result after edits) */
  editorHtml: string;
  /** The live CSS in the editor canvas */
  editorCss: string;
  /** Undo history — past states */
  undoStack: HistoryEntry[];
  /** Redo history — future states after undo */
  redoStack: HistoryEntry[];
  /**
   * Incremented each time an undo or redo completes so that subscribers
   * can detect the change and re-write the iframe content.
   */
  undoVersion: number;
  /** Viewport width in pixels (ZEST-026), or null for full desktop width */
  viewportWidth: number | null;
  /** Chat message thread (ZEST-015) */
  chatMessages: ChatMessage[];
}

export interface EditorActions {
  setSelectedElement: (element: ElementDescriptor | null) => void;
  setInlineEditing: (editing: boolean) => void;
  setEditorHtml: (html: string) => void;
  setEditorCss: (css: string) => void;
  /** Push current html/css onto the undo stack before applying a change */
  pushHistory: (html: string, css: string) => void;
  undo: () => void;
  redo: () => void;
  setViewportWidth: (width: number | null) => void;
  /** Append a message to the chat thread */
  appendChatMessage: (message: ChatMessage) => void;
  reset: () => void;
}

export type EditorStore = EditorState & EditorActions;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_HISTORY = 50;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: EditorState = {
  selectedElement: null,
  isInlineEditing: false,
  editorHtml: "",
  editorCss: "",
  undoStack: [],
  redoStack: [],
  undoVersion: 0,
  viewportWidth: null,
  chatMessages: [],
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  setSelectedElement: (element) => set({ selectedElement: element, isInlineEditing: false }),

  setInlineEditing: (editing) => set({ isInlineEditing: editing }),

  setEditorHtml: (html) => set({ editorHtml: html }),

  setEditorCss: (css) => set({ editorCss: css }),

  pushHistory: (html, css) => {
    const { undoStack } = get();
    const trimmed =
      undoStack.length >= MAX_HISTORY
        ? undoStack.slice(undoStack.length - MAX_HISTORY + 1)
        : undoStack;
    set({
      undoStack: [...trimmed, { html, css }],
      redoStack: [],
    });
  },

  undo: () => {
    const { undoStack, editorHtml, editorCss, redoStack, undoVersion } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      editorHtml: prev.html,
      editorCss: prev.css,
      undoStack: undoStack.slice(0, -1),
      redoStack: [{ html: editorHtml, css: editorCss }, ...redoStack],
      undoVersion: undoVersion + 1,
    });
  },

  redo: () => {
    const { redoStack, editorHtml, editorCss, undoStack, undoVersion } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    set({
      editorHtml: next.html,
      editorCss: next.css,
      redoStack: redoStack.slice(1),
      undoStack: [...undoStack, { html: editorHtml, css: editorCss }],
      undoVersion: undoVersion + 1,
    });
  },

  setViewportWidth: (width) => set({ viewportWidth: width }),

  appendChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  reset: () => set(initialState),
}));
