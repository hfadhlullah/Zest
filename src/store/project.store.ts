import { create } from "zustand";
import type { ProjectResponse } from "@/schemas/projects.schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProjectState {
  currentProject: ProjectResponse | null;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: Date | null;
}

export interface ProjectActions {
  setCurrentProject: (project: ProjectResponse | null) => void;
  setSaving: (isSaving: boolean) => void;
  setSaveError: (error: string | null) => void;
  setLastSavedAt: (date: Date) => void;
  reset: () => void;
}

export type ProjectStore = ProjectState & ProjectActions;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: ProjectState = {
  currentProject: null,
  isSaving: false,
  saveError: null,
  lastSavedAt: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useProjectStore = create<ProjectStore>((set) => ({
  ...initialState,

  setCurrentProject: (project) => set({ currentProject: project }),

  setSaving: (isSaving) => set({ isSaving }),

  setSaveError: (error) => set({ saveError: error }),

  setLastSavedAt: (date) => set({ lastSavedAt: date }),

  reset: () => set(initialState),
}));
