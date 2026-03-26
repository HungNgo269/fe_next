"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useFeedCacheUpdater } from "@/app/share/hooks/useFeedCacheUpdater";
import { useUser } from "@/app/share/providers/UserProvider";
import {
  createCommentAction,
  createCommentReportAction,
  deleteCommentAction,
  updateCommentAction,
} from "../actions/post.actions";
import { useOwnership } from "../hooks/useOwnership";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { usePostUIStore } from "../stores/postStore";

export function usePostCommentMutations(postId: string) {
  const currentUser = useUser();
  const { runIfAuth } = useRequireAuthAction();
  const cache = useFeedCacheUpdater();
  const { isCommentOwner, isPostOwner } = useOwnership();

  const commentDraft = usePostUIStore(
    (state) => state.commentDrafts[postId] ?? "",
  );
  const setCommentDraft = usePostUIStore((state) => state.setCommentDraft);

  const addCommentMutation = useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: string;
    }) => createCommentAction(postId, content, parentId),
    onSuccess: (result, variables) => {
      if (!result.ok || !currentUser) return;
      cache.appendComment(postId, {
        id: result.data.id,
        author: {
          id: currentUser.id,
          handle: currentUser.handle ?? null,
          name: currentUser.name,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl ?? undefined,
          gender: currentUser.gender,
        },
        content: result.data.content,
        createdAt: result.data.createdAt ?? new Date().toISOString(),
        parentId: variables.parentId ?? null,
        replies: [],
      });
      if (!variables.parentId) {
        setCommentDraft(postId, "");
      }
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => updateCommentAction(commentId, content),
    onSuccess: (result, { commentId }) => {
      if (!result.ok) return;
      cache.updateComment(postId, commentId, {
        content: result.data.content,
        createdAt: result.data.createdAt ?? new Date().toISOString(),
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommentAction(commentId),
    onSuccess: (result, commentId) => {
      if (!result.ok) return;
      cache.removeComment(postId, commentId);
    },
  });

  const reportCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      text,
    }: {
      commentId: string;
      text?: string;
    }) => createCommentReportAction(commentId, text),
  });

  const handleAddComment = useCallback(() => {
    runIfAuth(() => {
      if (!currentUser) return;
      const trimmed = commentDraft.trim();
      if (!trimmed) return;
      addCommentMutation.mutate({ content: trimmed });
    });
  }, [addCommentMutation, commentDraft, currentUser, runIfAuth]);

  const handleAddReply = useCallback(
    async (parentId: string, content: string): Promise<boolean> => {
      if (!runIfAuth(() => true)) return false;
      const trimmed = content.trim();
      if (!trimmed || !currentUser) return false;
      try {
        const result = await addCommentMutation.mutateAsync({
          content: trimmed,
          parentId,
        });
        return result.ok;
      } catch {
        return false;
      }
    },
    [addCommentMutation, currentUser, runIfAuth],
  );

  const handleSaveCommentEdit = useCallback(
    async (commentId: string, content: string): Promise<boolean> => {
      if (!runIfAuth(() => true)) return false;
      const trimmed = content.trim();
      if (!trimmed) return false;
      if (!isCommentOwner(postId, commentId)) return false;
      editCommentMutation.mutate({ commentId, content: trimmed });
      return true;
    },
    [editCommentMutation, isCommentOwner, postId, runIfAuth],
  );

  const handleDeleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      if (!runIfAuth(() => true)) return false;
      if (!isPostOwner(postId)) return false;
      deleteCommentMutation.mutate(commentId);
      return true;
    },
    [deleteCommentMutation, isPostOwner, postId, runIfAuth],
  );

  const handleReportComment = useCallback(
    async (commentId: string, text?: string): Promise<boolean> => {
      if (!runIfAuth(() => true)) return false;
      try {
        const result = await reportCommentMutation.mutateAsync({
          commentId,
          text,
        });
        return result.ok;
      } catch {
        return false;
      }
    },
    [reportCommentMutation, runIfAuth],
  );

  return {
    commentDraft,
    setCommentDraft: (value: string) => setCommentDraft(postId, value),
    isReportingComment: reportCommentMutation.isPending,
    handleAddComment,
    handleAddReply,
    handleSaveCommentEdit,
    handleDeleteComment,
    handleReportComment,
  };
}
