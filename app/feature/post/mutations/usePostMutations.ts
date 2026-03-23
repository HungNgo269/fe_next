"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { updatePostRequest, deletePostRequest } from "../api/postApi";
import { createPostReportRequest } from "../api/postReportApi";
import { usePostUIStore } from "../stores/postStore";
import { getFeedPostsFromCache } from "@/app/feature/feed/queries/feed.cache";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { useFeedCacheUpdater } from "@/app/share/hooks/useFeedCacheUpdater";
import { useOwnership } from "../hooks/useOwnership";

export function usePostMutations(postId: string) {
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

  const reportMutation = useMutation({
    mutationFn: ({ text }: { text?: string }) =>
      createPostReportRequest(postId, text),
  });

  const handleStartEdit = useCallback(() => {
    runIfAuth(() => {
      const post = getFeedPostsFromCache(queryClient).find(
        (item) => item.id === postId,
      );
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

  const handleReportPost = useCallback(
    async (text?: string): Promise<boolean> => {
      if (!runIfAuth(() => true)) return false;
      try {
        const result = await reportMutation.mutateAsync({ text });
        return result.ok;
      } catch {
        return false;
      }
    },
    [reportMutation, runIfAuth],
  );

  return {
    isEditing,
    editingText,
    isOwner,
    setEditingText,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit: clearEditing,
    handleDeletePost,
    isReportingPost: reportMutation.isPending,
    handleReportPost,
  };
}

