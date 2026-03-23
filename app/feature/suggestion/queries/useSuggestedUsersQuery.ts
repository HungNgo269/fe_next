"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { userToSuggestion } from "../types/suggestion.type";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";
import { fetchSuggestedUsers } from "../api/suggestionUserApi";
import { suggestionQueryKeys } from "./suggestion.query-keys";

export function useSuggestedUsersQuery() {
  const authProfile = useAppSessionStore((state) => state.authProfile);
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
        .filter((user) => user.id !== currentUserId)
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
