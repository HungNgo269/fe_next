"use client";

import { create } from "zustand";

type SessionState = {
  resetSessionState: () => void;
};

export const useAppSessionStore = create<SessionState>()((set) => ({
  resetSessionState: () => {
    set({});
  },
}));
