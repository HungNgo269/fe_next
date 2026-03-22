"use client";

import { useQuery } from "@tanstack/react-query";
import { userToSuggestion } from "../types/suggestion.type";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";
import { useMemo } from "react";
import { fetchSuggestedUsers } from "../api/suggestionUserApi";
import { suggestionQueryKeys } from "../queries/suggestion.query-keys";

export function useSuggestedUsers() {
  const authProfile = useAppSessionStore((s) => s.authProfile);
  const currentUserId = authProfile?.id;

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: suggestionQueryKeys.all,
    queryFn: async () => {
      const result = await fetchSuggestedUsers();
      if (!result.ok) throw new Error("Unable to load users.");
      return result.data;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const suggestions = useMemo(
    () =>
      allUsers
        .filter((u) => u.id !== currentUserId)
        .slice(0, 3)
        .map(userToSuggestion),
    [allUsers, currentUserId],
  );

  return {
    users: allUsers,
    suggestions,
    isLoading,
  };
}
