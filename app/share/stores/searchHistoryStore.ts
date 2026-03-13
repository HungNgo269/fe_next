"use client";

import { create } from "zustand";
import {
  persist,
  type PersistStorage,
  type StorageValue,
} from "zustand/middleware";

export type SearchHistoryItem = {
  id: string;
  name: string;
  handle: string | null;
  username: string | null;
};

type SearchHistoryState = {
  history: SearchHistoryItem[];
  pushToHistory: (user: SearchHistoryItem) => void;
  removeHistoryItem: (userId: string) => void;
  clearHistory: () => void;
};

type PersistedSearchHistoryState = Pick<SearchHistoryState, "history">;

const SEARCH_HISTORY_STORAGE_KEY = "fbclone-search-history";
const SEARCH_HISTORY_LIMIT = 12;

const toNullableString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const sanitizeSearchHistory = (value: unknown): SearchHistoryItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: SearchHistoryItem[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const id = (item as { id?: unknown }).id;
    const name = (item as { name?: unknown }).name;

    if (typeof id !== "string" || typeof name !== "string") {
      continue;
    }

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);
    normalized.push({
      id,
      name,
      handle: toNullableString((item as { handle?: unknown }).handle),
      username: toNullableString((item as { username?: unknown }).username),
    });

    if (normalized.length >= SEARCH_HISTORY_LIMIT) {
      break;
    }
  }

  return normalized;
};

const searchHistoryStorage: PersistStorage<PersistedSearchHistoryState> = {
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;

      if (Array.isArray(parsed)) {
        return {
          state: {
            history: sanitizeSearchHistory(parsed),
          },
          version: 0,
        };
      }

      if (typeof parsed !== "object" || parsed === null) {
        return null;
      }

      const storageValue = parsed as StorageValue<PersistedSearchHistoryState>;
      return {
        state: {
          history: sanitizeSearchHistory(storageValue.state?.history),
        },
        version:
          typeof storageValue.version === "number" ? storageValue.version : 0,
      };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      history: [],
      pushToHistory: (user) => {
        const normalizedUser = sanitizeSearchHistory([user])[0];
        if (!normalizedUser) {
          return;
        }

        set((state) => {
          const deduped = state.history.filter(
            (item) => item.id !== normalizedUser.id,
          );
          return {
            history: [normalizedUser, ...deduped].slice(0, SEARCH_HISTORY_LIMIT),
          };
        });
      },
      removeHistoryItem: (userId) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== userId),
        }));
      },
      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: SEARCH_HISTORY_STORAGE_KEY,
      storage: searchHistoryStorage,
      partialize: (state) => ({
        history: state.history,
      }),
    },
  ),
);
