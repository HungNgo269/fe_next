"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { logoutAction } from "@/app/feature/auth/actions/auth.actions";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await logoutAction();
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  }, [queryClient, router]);
}
