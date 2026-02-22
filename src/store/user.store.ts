import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserState {
  generationCount: number;
  generationLimit: number;
  plan: "free" | "paid";
  generationResetAt: Date | null;
}

export interface UserActions {
  setGenerationCount: (count: number) => void;
  setGenerationLimit: (limit: number) => void;
  setPlan: (plan: "free" | "paid") => void;
  setGenerationResetAt: (date: Date | null) => void;
  incrementGenerationCount: () => void;
  reset: () => void;
}

export type UserStore = UserState & UserActions;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: UserState = {
  generationCount: 0,
  generationLimit: 10, // Free tier default
  plan: "free",
  generationResetAt: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUserStore = create<UserStore>((set) => ({
  ...initialState,

  setGenerationCount: (count) => set({ generationCount: count }),

  setGenerationLimit: (limit) => set({ generationLimit: limit }),

  setPlan: (plan) => set({ plan }),

  setGenerationResetAt: (date) => set({ generationResetAt: date }),

  incrementGenerationCount: () =>
    set((state) => ({
      generationCount: Math.min(
        state.generationCount + 1,
        state.generationLimit
      ),
    })),

  reset: () => set(initialState),
}));
