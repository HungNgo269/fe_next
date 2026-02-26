"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  createLikeRequest,
  deleteLikeRequest,
} from "../api/feedApi";
import type { Post } from "../types/api.types";
import type { FeedBootstrapData } from "../types/feed";
import { usePostUIStore } from "../stores/postStore";
import { FEED_QUERY_KEY } from "./useFeedQuery";
import { usePostCacheUpdate } from "./usePostCacheUpdate";
import {
  useAppSessionStore,
} from "@/app/share/stores/appSessionStore";
import { clientGetJson } from "@/app/share/utils/api";

type LikeEntry = { id: string; postId: string; userId: string };

export function useLikeMutations(postId: string) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAppSessionStore((state) => state.isAuthenticated);
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const setShowLoginDialog = usePostUIStore((s) => s.setShowLoginDialog);
  const updatePostsInAllCaches = usePostCacheUpdate();

  const currentUserId = authProfile?.id ?? "";

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return false;
    }
    return true;
  }, [isAuthenticated, setShowLoginDialog]);

  const findLikeIdForPost = async (): Promise<string | undefined> => {
    if (!currentUserId) return undefined;
    const result = await clientGetJson<LikeEntry[]>(
      `/likes?postId=${postId}&userId=${currentUserId}`,
    );
    if (!result.ok) return undefined;
    return result.data[0]?.id;
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      const feedData = queryClient.getQueryData<FeedBootstrapData>(FEED_QUERY_KEY);
      const post = feedData?.posts.find((p) => p.id === postId);
      if (!post) return;

      if (post.likedByMe) {
        // Unlike — find the like ID via API
        const likeId = await findLikeIdForPost();
        if (!likeId) throw new Error("Unable to unlike post.");
        const result = await deleteLikeRequest(likeId);
        if (!result.ok) throw new Error(result.error.messages[0] ?? "Unable to unlike.");
        return { action: "unlike" as const };
      } else {
        // Like
        const result = await createLikeRequest(postId, currentUserId);
        if (!result.ok) throw new Error(result.error.messages[0] ?? "Unable to like.");
        return { action: "like" as const, likeId: result.data.id };
      }
    },
    onMutate: async () => {
      // Optimistic update
      const feedData = queryClient.getQueryData<FeedBootstrapData>(FEED_QUERY_KEY);
      const post = feedData?.posts.find((p) => p.id === postId);
      if (!post) return { previousLiked: false };

      const previousLiked = post.likedByMe;
      updatePostsInAllCaches((posts) =>
        posts.map((p) => {
          if (p.id !== postId) return p;
          const nextLiked = !p.likedByMe;
          return { ...p, likedByMe: nextLiked, likesCount: p.likesCount + (nextLiked ? 1 : -1) };
        }),
      );
      return { previousLiked };
    },
    onError: (_err, _vars, context) => {
      // Rollback optimistic update
      if (context) {
        updatePostsInAllCaches((posts) =>
          posts.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              likedByMe: context.previousLiked,
              likesCount: p.likesCount + (context.previousLiked ? 1 : -1),
            };
          }),
        );
      }
    },
  });

  const handleToggleLike = () => {
    if (!requireAuth()) return;
    likeMutation.mutate();
  };

  return { handleToggleLike, isLiking: likeMutation.isPending };
}
