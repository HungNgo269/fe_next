"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { createPostRequest } from "../api/feedApi";
import type { Post } from "../types/api.types";
import { usePostUIStore } from "../stores/postStore";
import { usePostCacheUpdate } from "./usePostCacheUpdate";
import {
  useAppSessionStore,
  toAvatarFromProfile,
} from "@/app/share/stores/appSessionStore";

export function useCreatePost() {
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const isAuthenticated = useAppSessionStore((state) => state.isAuthenticated);
  const setShowLoginDialog = usePostUIStore((s) => s.setShowLoginDialog);
  const updatePostsInCache = usePostCacheUpdate();

  const currentUser = toAvatarFromProfile(authProfile);

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return false;
    }
    return true;
  }, [isAuthenticated, setShowLoginDialog]);

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
        comments: [],
        mediaUrls: [],
      };
      updatePostsInCache((posts) => [newPost, ...posts]);
    },
  });

  const handleCreatePost = useCallback(
    (content: string) => {
      if (!requireAuth()) return;
      const trimmed = content.trim();
      if (!trimmed) return;
      createMutation.mutate(trimmed);
    },
    [requireAuth, createMutation],
  );

  return { handleCreatePost, isCreating: createMutation.isPending };
}
