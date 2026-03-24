"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "@/app/feature/auth/api/authApi";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await logout();
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  }, [queryClient, router]);
}
