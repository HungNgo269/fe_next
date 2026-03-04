"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { createPostRequest } from "@/app/feature/post/api/postApi";
import type { Post } from "@/app/feature/post/types/api.types";
import {
  useAppSessionStore,
  toAvatarFromProfile,
} from "@/app/share/stores/appSessionStore";
import { useRequireAuthAction } from "@/app/feature/post/hooks/useRequireAuthAction";
import { useFeedCacheUpdater } from "@/app/share/hooks/useFeedCacheUpdater";
import { FEED_QUERY_KEY } from "@/app/share/hooks/feedQueryKeys";

export function useCreatePost() {
  const queryClient = useQueryClient();
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const { runIfAuth } = useRequireAuthAction();
  const cache = useFeedCacheUpdater();

  const currentUser = toAvatarFromProfile(authProfile);

  const createMutation = useMutation({
    mutationFn: (content: string) =>
      createPostRequest(content, currentUser!.id),
    onSuccess: async (result, content) => {
      if (!result.ok) return;
      const newPost: Post = {
        id: result.data.id,
        author: {
          id: currentUser!.id,
          name: currentUser!.name,
          email: "",
          avatarUrl: currentUser!.avatarUrl ?? undefined,
          gender: currentUser!.gender,
        },
        createdAt: new Date().toISOString(),
        content: content.trim(),
        likesCount: 0,
        likedByMe: false,
        commentsCount: 0,
        sharesCount: 0,
        mediaUrls: [],
      };
      cache.prependPost(newPost);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["profile-feed"] }),
      ]);
    },
  });

  const handleCreatePost = useCallback(
    (content: string) => {
      runIfAuth(() => {
        const trimmed = content.trim();
        if (!trimmed) return;
        createMutation.mutate(trimmed);
      });
    },
    [runIfAuth, createMutation],
  );

  return { handleCreatePost, isCreating: createMutation.isPending };
}
