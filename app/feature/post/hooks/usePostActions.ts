"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { updatePostRequest, deletePostRequest } from "../api/feedApi";
import { usePostUIStore } from "../stores/postStore";
import type { FeedBootstrapData } from "../types/feed";
import { FEED_QUERY_KEY } from "./useFeedQuery";
import { useRequireAuthAction } from "./useRequireAuthAction";
import { useFeedCacheUpdater } from "./useFeedCacheUpdater";
import { useOwnership } from "./useOwnership";

export function usePostActions(postId: string) {
  const queryClient = useQueryClient();
  const { runIfAuth } = useRequireAuthAction();
  const cache = useFeedCacheUpdater();
  const { isPostOwner } = useOwnership();

  const editingPostId = usePostUIStore((state) => state.editingPostId);
  const editingText = usePostUIStore((state) => state.editingText);
  const startEditing = usePostUIStore((state) => state.startEditing);
  const setEditingText = usePostUIStore((state) => state.setEditingText);
  const clearEditing = usePostUIStore((state) => state.clearEditing);

  const isEditing = editingPostId === postId;
  const isOwner = isPostOwner(postId);

  const updateMutation = useMutation({
    mutationFn: (content: string) => updatePostRequest(postId, content),
    onSuccess: (result, content) => {
      if (!result.ok) return;
      cache.updatePostContent(postId, content);
      clearEditing();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePostRequest(postId),
    onSuccess: (result) => {
      if (!result.ok) return;
      cache.removePost(postId);
      if (editingPostId === postId) clearEditing();
    },
  });

  const handleStartEdit = useCallback(() => {
    runIfAuth(() => {
      const post = queryClient
        .getQueryData<FeedBootstrapData>(FEED_QUERY_KEY)
        ?.posts.find((item) => item.id === postId);
      if (!post) return;
      startEditing(postId, post.content);
    });
  }, [postId, queryClient, runIfAuth, startEditing]);

  const handleSaveEdit = useCallback(() => {
    runIfAuth(() => {
      const trimmed = editingText.trim();
      if (!trimmed) return;
      updateMutation.mutate(trimmed);
    });
  }, [editingText, runIfAuth, updateMutation]);

  const handleDeletePost = useCallback(() => {
    runIfAuth(() => deleteMutation.mutate());
  }, [deleteMutation, runIfAuth]);

  return {
    isEditing,
    editingText,
    isOwner,
    setEditingText,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit: clearEditing,
    handleDeletePost,
  };
}
