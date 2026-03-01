"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "@/app/feature/post/types/api.types";
import type { UserProfile } from "@/app/feature/profile/types/profile";

export type ThemePreference = "light" | "dark";

export type AuthProfile = UserProfile & {
  id: string;
};

type SessionState = {
  authProfile: AuthProfile | null;
  isAuthenticated: boolean;
  themePreference: ThemePreference;
  setAuthenticatedProfile: (profile: AuthProfile) => void;
  updateAuthenticatedProfile: (profile: Partial<AuthProfile>) => void;
  clearAuthenticatedProfile: () => void;
  setThemePreference: (theme: ThemePreference) => void;
};

export const toAvatarFromProfile = (
  profile: AuthProfile | null,
): User | null => {
  if (!profile) {
    return null;
  }
  return {
    id: profile.id,
    handle: profile.handle ?? null,
    name: profile.name,
    email: profile.email ?? "",
    avatarUrl: profile.avatar,
    gender: profile.gender,
  };
};

export const useAppSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      authProfile: null,
      isAuthenticated: false,
      themePreference: "light",
      setAuthenticatedProfile: (profile) => {
        set({
          authProfile: profile,
          isAuthenticated: true,
        });
      },
      updateAuthenticatedProfile: (profilePatch) => {
        set((state) => {
          if (!state.authProfile) {
            return state;
          }
          return {
            authProfile: { ...state.authProfile, ...profilePatch },
            isAuthenticated: true,
          };
        });
      },
      clearAuthenticatedProfile: () => {
        set({
          authProfile: null,
          isAuthenticated: false,
        });
      },
      setThemePreference: (theme) => {
        set({ themePreference: theme });
      },
    }),
    {
      name: "fbclone-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        authProfile: state.authProfile,
        isAuthenticated: state.isAuthenticated,
        themePreference: state.themePreference,
      }),
    },
  ),
);
