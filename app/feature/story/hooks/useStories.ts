"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";
import { STORY_THEMES, STORY_TITLES } from "@/app/feature/story/data/story";
import type { StoryData } from "@/app/feature/story/types/story";
import { fetchSuggestedUsers } from "@/app/feature/suggestion/api/suggestionUserApi";
import { suggestionQueryKeys } from "@/app/feature/suggestion/queries/suggestion.query-keys";

export function useStories() {
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

  const stories: StoryData[] = useMemo(
    () =>
      allUsers
        .filter((u) => u.id !== currentUserId)
        .slice(0, 4)
        .map((user, i) => ({
          id: `story-${user.id}`,
          title: STORY_TITLES[i % STORY_TITLES.length],
          author: user,
          theme: STORY_THEMES[i % STORY_THEMES.length],
        })),
    [allUsers, currentUserId],
  );

  return { stories, isLoading };
}
