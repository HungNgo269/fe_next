"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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

const SEARCH_HISTORY_STORAGE_KEY = "fbclone-search-history";
const SEARCH_HISTORY_LIMIT = 12;

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      history: [],
      pushToHistory: (user) => {
        set((state) => {
          const deduped = state.history.filter((item) => item.id !== user.id);
          return {
            history: [user, ...deduped].slice(0, SEARCH_HISTORY_LIMIT),
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
      }),
    },
  ),
);
