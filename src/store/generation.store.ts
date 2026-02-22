import { create } from "zustand";
import type { ErrorCode, GenerateResponseData } from "@/types/api";
import type { OutputFormat } from "@/components/prompt-bar/PromptBar.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerationError {
  code: ErrorCode;
  message: string;
}

export interface GenerationState {
  prompt: string;
  result: GenerateResponseData | null;
  format: OutputFormat;
  isLoading: boolean;
  error: GenerationError | null;
}

export interface GenerationActions {
  setPrompt: (prompt: string) => void;
  setFormat: (format: OutputFormat) => void;
  setLoading: (isLoading: boolean) => void;
  setResult: (result: GenerateResponseData) => void;
  setError: (error: GenerationError | null) => void;
  reset: () => void;
}

export type GenerationStore = GenerationState & GenerationActions;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: GenerationState = {
  prompt: "",
  result: null,
  format: "html_css",
  isLoading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGenerationStore = create<GenerationStore>((set) => ({
  ...initialState,

  setPrompt: (prompt) => set({ prompt }),

  setFormat: (format) => set({ format }),

  setLoading: (isLoading) => set({ isLoading }),

  setResult: (result) =>
    set({ result, isLoading: false, error: null }),

  setError: (error) =>
    set({ error, isLoading: false }),

  reset: () => set(initialState),
}));
