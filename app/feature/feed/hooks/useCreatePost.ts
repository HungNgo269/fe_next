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
    mutationFn: (payload: { content: string; mediaFiles: File[] }) =>
      createPostRequest(payload.content, payload.mediaFiles),
    onSuccess: async (result, payload) => {
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
        content: payload.content.trim(),
        likesCount: 0,
        likedByMe: false,
        commentsCount: 0,
        sharesCount: 0,
        mediaUrls: result.data.mediaUrls ?? [],
      };
      cache.prependPost(newPost);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["profile-feed"] }),
      ]);
    },
  });

  const handleCreatePost = useCallback(
    (content: string, mediaFiles: File[] = []) => {
      runIfAuth(() => {
        const trimmed = content.trim();
        if (!trimmed && mediaFiles.length === 0) return;
        createMutation.mutate({ content: trimmed, mediaFiles });
      });
    },
    [runIfAuth, createMutation],
  );

  return { handleCreatePost, isCreating: createMutation.isPending };
}
