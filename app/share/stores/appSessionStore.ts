"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark";

type SessionState = {
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
};

export const useAppSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      themePreference: "light",
      setThemePreference: (theme) => {
        set({ themePreference: theme });
      },
    }),
    {
      name: "fbclone-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        themePreference: state.themePreference,
      }),
    },
  ),
);
