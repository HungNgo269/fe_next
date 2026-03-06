"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { FeedBootstrapData } from "@/app/feature/feed/types/feed";
import { FEED_QUERY_KEY } from "@/app/share/hooks/feedQueryKeys";
import { clientGetJson } from "@/app/share/utils/api";
import { useOwnership } from "./useOwnership";
import { useRequireAuthAction } from "./useRequireAuthAction";
import { useFeedCacheUpdater } from "@/app/share/hooks/useFeedCacheUpdater";
import type { Post } from "../types/api.types";
import { createLikeRequest, deleteLikeRequest } from "../api/postLikeApi";

type LikeEntry = { id: string; postId: string; userId: string };

function findPostInCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
): Post | undefined {
  const feedData = queryClient.getQueryData<FeedBootstrapData>(FEED_QUERY_KEY);
  const fromFeed = feedData?.posts.find(
    (p) => p.id === postId || p.sourcePostId === postId,
  );
  if (fromFeed) return fromFeed;

  const profileCaches = queryClient.getQueriesData<{ posts: Post[] }>({
    queryKey: ["profile-feed"],
  });
  for (const [, data] of profileCaches) {
    const found = data?.posts.find(
      (p) => p.id === postId || p.sourcePostId === postId,
    );
    if (found) return found;
  }

  return undefined;
}

export function useLikeActions(postId: string) {
  const queryClient = useQueryClient();
  const { currentUserId } = useOwnership();
  const { runIfAuth } = useRequireAuthAction();
  const cache = useFeedCacheUpdater();

  const findLikeIdForPost = async (): Promise<string | undefined> => {
    if (!currentUserId) return undefined;
    const result = await clientGetJson<LikeEntry[]>(
      `/likes?postId=${postId}&userId=${currentUserId}`,
    );
    if (!result.ok) return undefined;
    return result.data[0]?.id;
  };

  const likeMutation = useMutation({
    // Optimistic update
    onMutate: async () => {
      const post = findPostInCaches(queryClient, postId);
      const wasLiked = post?.likedByMe ?? false;

      cache.toggleLike(postId);

      return { wasLiked };
    },
    // API call
    mutationFn: async (wasLiked: boolean) => {
      if (wasLiked) {
        const likeId = await findLikeIdForPost();
        if (!likeId) throw new Error("Unable to unlike post.");
        const result = await deleteLikeRequest(likeId);
        if (!result.ok)
          throw new Error(result.error.messages[0] ?? "Unable to unlike.");
        return;
      }

      const result = await createLikeRequest(postId);
      if (!result.ok)
        throw new Error(result.error.messages[0] ?? "Unable to like.");
    },
    // Rollback on error
    onError: (_error, _variables, context) => {
      if (context) {
        cache.toggleLike(postId, context.wasLiked);
      }
    },
  });

  const handleToggleLike = useCallback(() => {
    runIfAuth(() => {
      const post = findPostInCaches(queryClient, postId);
      const wasLiked = post?.likedByMe ?? false;
      likeMutation.mutate(wasLiked);
    });
  }, [likeMutation, runIfAuth, queryClient, postId]);

  return { handleToggleLike, isLiking: likeMutation.isPending };
}
