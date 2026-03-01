"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { createPostRequest } from "../api/feedApi";
import type { Post } from "../types/api.types";
import {
  useAppSessionStore,
  toAvatarFromProfile,
} from "@/app/share/stores/appSessionStore";
import { useRequireAuthAction } from "./useRequireAuthAction";
import { useFeedCacheUpdater } from "./useFeedCacheUpdater";

export function useCreatePost() {
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const { runIfAuth } = useRequireAuthAction();
  const cache = useFeedCacheUpdater();

  const currentUser = toAvatarFromProfile(authProfile);

  const createMutation = useMutation({
    mutationFn: (content: string) =>
      createPostRequest(content, currentUser!.id),
    onSuccess: (result, content) => {
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
