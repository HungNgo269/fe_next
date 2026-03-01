"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  createCommentRequest,
  updateCommentRequest,
  deleteCommentRequest,
} from "../api/feedApi";
import { usePostUIStore } from "../stores/postStore";
import { useAppSessionStore, toAvatarFromProfile } from "@/app/share/stores/appSessionStore";
import { useRequireAuthAction } from "./useRequireAuthAction";
import { useFeedCacheUpdater } from "./useFeedCacheUpdater";
import { useOwnership } from "./useOwnership";

export function useCommentActions(postId: string) {
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const currentUser = toAvatarFromProfile(authProfile);
  const { runIfAuth } = useRequireAuthAction();
  const cache = useFeedCacheUpdater();
  const { isCommentOwner } = useOwnership();

  const commentDraft = usePostUIStore((state) => state.commentDrafts[postId] ?? "");
  const setCommentDraft = usePostUIStore((state) => state.setCommentDraft);

  const addCommentMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      createCommentRequest(postId, currentUser!.id, content, parentId),
    onSuccess: (result, variables) => {
      if (!result.ok || !currentUser) return;
      cache.appendComment(postId, {
        id: result.data.id,
        author: {
          id: currentUser.id,
          handle: currentUser.handle ?? null,
          name: currentUser.name,
          email: "",
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
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateCommentRequest(commentId, content),
    onSuccess: (result, { commentId }) => {
      if (!result.ok) return;
      cache.updateComment(postId, commentId, {
        content: result.data.content,
        createdAt: result.data.createdAt ?? new Date().toISOString(),
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommentRequest(commentId),
    onSuccess: (result, commentId) => {
      if (!result.ok) return;
      cache.removeComment(postId, commentId);
    },
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
      if (!isCommentOwner(postId, commentId)) return false;
      deleteCommentMutation.mutate(commentId);
      return true;
    },
    [deleteCommentMutation, isCommentOwner, postId, runIfAuth],
  );

  const handleReportContent = useCallback((contentType: "post" | "comment") => {
    const message =
      contentType === "post"
        ? "Report submitted for this post (demo)."
        : "Report submitted for this comment (demo).";
    console.info(message);
  }, []);

  return {
    commentDraft,
    setCommentDraft: (value: string) => setCommentDraft(postId, value),
    handleAddComment,
    handleAddReply,
    handleSaveCommentEdit,
    handleDeleteComment,
    handleReportContent,
  };
}
