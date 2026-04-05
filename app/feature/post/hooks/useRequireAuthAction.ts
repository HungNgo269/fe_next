"use client";

import { useCallback } from "react";
import { usePostUIStore } from "../stores/postStore";
import { useUser } from "@/app/share/providers/UserProvider";

export function useRequireAuthAction() {
  const currentUser = useUser();
  const setShowLoginDialog = usePostUIStore(
    (state) => state.setShowLoginDialog,
  );

  const requireAuth = useCallback(() => {
    if (!currentUser) {
      setShowLoginDialog(true);
      return false;
    }
    return true;
  }, [currentUser, setShowLoginDialog]);

  const runIfAuth = useCallback(
    <T>(action: () => T): T | undefined => {
      if (!requireAuth()) return undefined;
    },
    [requireAuth],
  );

  return { requireAuth, runIfAuth };
}
