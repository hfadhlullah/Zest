import { create } from "zustand";
import type { OutputFormat } from "@/components/prompt-bar/PromptBar.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExportState {
  isOpen: boolean;
  selectedFormat: OutputFormat;
  selectedFiles: Set<string>; // "html", "css", "index.html", etc.
  isExporting: boolean;
  error: string | null;
}

export interface ExportActions {
  openExportModal: () => void;
  closeExportModal: () => void;
  setSelectedFormat: (format: OutputFormat) => void;
  toggleFileSelection: (filename: string) => void;
  setFileSelection: (files: Set<string>) => void;
  setExporting: (isExporting: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type ExportStore = ExportState & ExportActions;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: ExportState = {
  isOpen: false,
  selectedFormat: "html_css",
  selectedFiles: new Set(["html", "css"]), // Default selection
  isExporting: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useExportStore = create<ExportStore>((set) => ({
  ...initialState,

  openExportModal: () => set({ isOpen: true, error: null }),

  closeExportModal: () => set({ isOpen: false }),

  setSelectedFormat: (format) => set({ selectedFormat: format }),

  toggleFileSelection: (filename) =>
    set((state) => {
      const newSet = new Set(state.selectedFiles);
      if (newSet.has(filename)) {
        newSet.delete(filename);
      } else {
        newSet.add(filename);
      }
      return { selectedFiles: newSet };
    }),

  setFileSelection: (files) => set({ selectedFiles: files }),

  setExporting: (isExporting) => set({ isExporting }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
