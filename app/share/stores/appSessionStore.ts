"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AvatarInfo } from "@/app/feature/post/types/feed";
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

export const GUEST_AVATAR: AvatarInfo & { id: string } = {
  id: "guest-user",
  name: "Guest",
  handle: "guest",
  initials: "GU",
  colorClass: "avatar-slate",
};

const toInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "U";
  }
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
};

const colorFromId = (id: string): string => {
  const palette = [
    "avatar-blue",
    "avatar-teal",
    "avatar-orange",
    "avatar-green",
    "avatar-indigo",
    "avatar-slate",
    "avatar-purple",
  ];
  const hash = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[hash % palette.length] ?? "avatar-slate";
};

const toHandle = (name: string, fallback: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return slug || fallback.toLowerCase();
};

export const toAvatarFromProfile = (
  profile: AuthProfile | null,
): AvatarInfo & { id: string } => {
  if (!profile) {
    return GUEST_AVATAR;
  }
  const fallback = profile.email.split("@")[0] ?? "user";
  return {
    id: profile.id,
    name: profile.name,
    handle: toHandle(profile.name, fallback),
    initials: toInitials(profile.name),
    colorClass: colorFromId(profile.id),
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
