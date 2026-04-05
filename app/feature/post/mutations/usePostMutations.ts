"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  createPostReportAction,
  deletePostAction,
  updatePostAction,
} from "../actions/post.actions";
import { usePostUIStore } from "../stores/postStore";
import { getFeedPostsFromCache } from "@/app/feature/feed/queries/feed.cache";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { useFeedCacheUpdater } from "@/app/share/hooks/useFeedCacheUpdater";
import { useOwnership } from "../hooks/useOwnership";
import {
  getApiResultMessage,
  getApiResultStatus,
  isForbiddenStatus,
  isUnauthenticatedStatus,
} from "@/app/share/utils/api-result";

const POST_PERMISSION_MESSAGE =
  "You do not have permission to modify this post.";
const POST_SESSION_MESSAGE = "Your session has expired. Please sign in again.";

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
    mutationFn: (content: string) => updatePostAction(postId, content),
    onSuccess: (result, content) => {
      if (!result.ok) return;
      cache.updatePostContent(postId, content);
      clearEditing();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePostAction(postId),
    onSuccess: (result) => {
      if (!result.ok) return;
      cache.removePost(postId);
      if (editingPostId === postId) clearEditing();
    },
  });

  const reportMutation = useMutation({
    mutationFn: ({ text }: { text?: string }) =>
      createPostReportAction(postId, text),
  });

  const handleStartEdit = useCallback(() => {
    runIfAuth(() => {
      if (!isOwner) {
        toast.error(POST_PERMISSION_MESSAGE);
        return;
      }
      const post = getFeedPostsFromCache(queryClient).find(
        (item) => item.id === postId,
      );
      if (!post) return;
      startEditing(postId, post.content);
    });
  }, [isOwner, postId, queryClient, runIfAuth, startEditing]);

  const handleSaveEdit = useCallback(() => {
    runIfAuth(async () => {
      if (!isOwner) {
        toast.error(POST_PERMISSION_MESSAGE);
        return;
      }
      const trimmed = editingText.trim();
      if (!trimmed) return;
      const result = await updateMutation.mutateAsync(trimmed);
      if (!result.ok) {
        const status = getApiResultStatus(result);
        toast.error(
          isForbiddenStatus(status)
            ? POST_PERMISSION_MESSAGE
            : isUnauthenticatedStatus(status)
              ? POST_SESSION_MESSAGE
              : getApiResultMessage(result, "Unable to update post."),
        );
        return;
      }
    });
  }, [editingText, isOwner, runIfAuth, updateMutation]);

  const handleDeletePost = useCallback(() => {
    runIfAuth(async () => {
      if (!isOwner) {
        toast.error(POST_PERMISSION_MESSAGE);
        return;
      }
      const result = await deleteMutation.mutateAsync();
      if (!result.ok) {
        const status = getApiResultStatus(result);
        toast.error(
          isForbiddenStatus(status)
            ? POST_PERMISSION_MESSAGE
            : isUnauthenticatedStatus(status)
              ? POST_SESSION_MESSAGE
              : getApiResultMessage(result, "Unable to delete post."),
        );
      }
    });
  }, [deleteMutation, isOwner, runIfAuth]);

  const handleReportPost = useCallback(
    async (text?: string): Promise<boolean> => {
      if (!runIfAuth(() => true)) return false;
      try {
        const result = await reportMutation.mutateAsync({ text });
        if (!result.ok) {
          const status = getApiResultStatus(result);
          toast.error(
            isForbiddenStatus(status)
              ? "You do not have permission to report this post."
              : isUnauthenticatedStatus(status)
                ? POST_SESSION_MESSAGE
                : getApiResultMessage(result, "Unable to report post."),
          );
        }
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

