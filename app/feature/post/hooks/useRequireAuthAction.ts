"use client";

import { useCallback } from "react";
import { usePostUIStore } from "../stores/postStore";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";

export function useRequireAuthAction() {
  const isAuthenticated = useAppSessionStore((state) => state.isAuthenticated);
  const setShowLoginDialog = usePostUIStore((state) => state.setShowLoginDialog);

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return false;
    }
    return true;
  }, [isAuthenticated, setShowLoginDialog]);

  const runIfAuth = useCallback(
    <T,>(action: () => T): T | undefined => {
      if (!requireAuth()) return undefined;
      return action();
    },
    [requireAuth],
  );

  return { requireAuth, runIfAuth };
}
