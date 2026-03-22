"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "@/app/feature/auth/api/authApi";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuthenticatedProfile = useAppSessionStore(
    (state) => state.clearAuthenticatedProfile,
  );

  return useCallback(async () => {
    await logout();
    clearAuthenticatedProfile();
    queryClient.clear();
    router.replace("/login");
  }, [clearAuthenticatedProfile, queryClient, router]);
}
