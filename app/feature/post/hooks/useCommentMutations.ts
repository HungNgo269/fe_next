"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  createCommentRequest,
  updateCommentRequest,
  deleteCommentRequest,
} from "../api/feedApi";
import type { Post } from "../types/api.types";
import type { FeedBootstrapData } from "../types/feed";
import { usePostUIStore } from "../stores/postStore";
import { FEED_QUERY_KEY } from "./useFeedQuery";
import { usePostCacheUpdate } from "./usePostCacheUpdate";
import {
  useAppSessionStore,
  toAvatarFromProfile,
} from "@/app/share/stores/appSessionStore";

export function useCommentMutations(postId: string) {
  const queryClient = useQueryClient();
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const isAuthenticated = useAppSessionStore((state) => state.isAuthenticated);
  const setShowLoginDialog = usePostUIStore((s) => s.setShowLoginDialog);
  const updatePostsInAllCaches = usePostCacheUpdate();

  const currentUser = toAvatarFromProfile(authProfile);

  const commentDraft = usePostUIStore(
    (s) => s.commentDrafts[postId] ?? "",
  );
  const setCommentDraft = usePostUIStore((s) => s.setCommentDraft);

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return false;
    }
    return true;
  }, [isAuthenticated, setShowLoginDialog]);

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      createCommentRequest(postId, currentUser!.id, content),
    onSuccess: (result, content) => {
      if (!result.ok) return;
      updatePostsInAllCaches((posts) =>
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: result.data.id,
                    author: {
                      id: currentUser!.id,
                      name: currentUser!.name,
                      email: "",
                      avatarUrl: currentUser!.avatarUrl ?? undefined,
                      gender: currentUser!.gender,
                    },
                    content: result.data.content,
                    createdAt: result.data.createdAt ?? new Date().toISOString(),
                  },
                ],
              }
            : p,
        ),
      );
      setCommentDraft(postId, "");
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateCommentRequest(commentId, content),
    onSuccess: (result, { commentId, content }) => {
      if (!result.ok) return;
      updatePostsInAllCaches((posts) =>
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.map((c) =>
                  c.id === commentId
                    ? { ...c, content: result.data.content, createdAt: result.data.createdAt ?? new Date().toISOString() }
                    : c,
                ),
              }
            : p,
        ),
      );
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommentRequest(commentId),
    onSuccess: (result, commentId) => {
      if (!result.ok) return;
      updatePostsInAllCaches((posts) =>
        posts.map((p) =>
          p.id === postId
            ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
            : p,
        ),
      );
    },
  });

  const handleAddComment = () => {
    if (!requireAuth()) return;
    const trimmed = commentDraft.trim();
    if (!trimmed) return;
    addCommentMutation.mutate(trimmed);
  };

  const handleSaveCommentEdit = async (
    commentId: string,
    content: string,
  ): Promise<boolean> => {
    if (!requireAuth()) return false;
    const trimmed = content.trim();
    if (!trimmed) return false;

    const post = queryClient
      .getQueryData<FeedBootstrapData>(FEED_QUERY_KEY)
      ?.posts.find((p) => p.id === postId);
    const comment = post?.comments.find((c) => c.id === commentId);
    if (!comment || comment.author.id !== currentUser!.id) return false;

    editCommentMutation.mutate({ commentId, content: trimmed });
    return true;
  };

  const handleDeleteComment = async (commentId: string): Promise<boolean> => {
    if (!requireAuth()) return false;

    const post = queryClient
      .getQueryData<FeedBootstrapData>(FEED_QUERY_KEY)
      ?.posts.find((p) => p.id === postId);
    const comment = post?.comments.find((c) => c.id === commentId);
    if (!comment || comment.author.id !== currentUser!.id) return false;

    deleteCommentMutation.mutate(commentId);
    return true;
  };

  const handleReportContent = (contentType: "post" | "comment") => {
    const msg =
      contentType === "post"
        ? "Report submitted for this post (demo)."
        : "Report submitted for this comment (demo).";
    console.info(msg);
  };

  return {
    commentDraft,
    setCommentDraft: (value: string) => setCommentDraft(postId, value),
    handleAddComment,
    handleSaveCommentEdit,
    handleDeleteComment,
    handleReportContent,
  };
}
