"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { Post } from "../types/api.types";
import type { FeedBootstrapData } from "../types/feed";
import { FEED_QUERY_KEY } from "./useFeedQuery";

export function usePostCacheUpdate() {
  const queryClient = useQueryClient();

  return useCallback(
    (updater: (posts: Post[]) => Post[]) => {
      queryClient.setQueriesData<FeedBootstrapData>(
        { queryKey: FEED_QUERY_KEY },
        (old) => (old ? { ...old, posts: updater(old.posts) } : old),
      );
      queryClient.setQueriesData<{ posts: Post[] }>(
        { queryKey: ["profile-feed"] },
        (old) => (old ? { ...old, posts: updater(old.posts) } : old),
      );
    },
    [queryClient],
  );
}
