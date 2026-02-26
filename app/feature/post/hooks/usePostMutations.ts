"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  updatePostRequest,
  deletePostRequest,
} from "../api/feedApi";
import { usePostUIStore } from "../stores/postStore";
import { FEED_QUERY_KEY } from "./useFeedQuery";
import { usePostCacheUpdate } from "./usePostCacheUpdate";
import type { FeedBootstrapData } from "../types/feed";
import {
  useAppSessionStore,
  toAvatarFromProfile,
} from "@/app/share/stores/appSessionStore";

export function usePostMutations(postId: string) {
  const queryClient = useQueryClient();
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const isAuthenticated = useAppSessionStore((state) => state.isAuthenticated);

  const editingPostId = usePostUIStore((s) => s.editingPostId);
  const editingText = usePostUIStore((s) => s.editingText);
  const startEditing = usePostUIStore((s) => s.startEditing);
  const setEditingText = usePostUIStore((s) => s.setEditingText);
  const clearEditing = usePostUIStore((s) => s.clearEditing);
  const setShowLoginDialog = usePostUIStore((s) => s.setShowLoginDialog);
  const updatePostsInCache = usePostCacheUpdate();

  const currentUser = toAvatarFromProfile(authProfile);
  const isEditing = editingPostId === postId;
  const isOwner = !currentUser ? false
    : (() => {
        const data = queryClient.getQueryData<FeedBootstrapData>(FEED_QUERY_KEY);
        const post = data?.posts.find((p) => p.id === postId);
        return post?.author.id === currentUser.id;
      })();

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return false;
    }
    return true;
  }, [isAuthenticated, setShowLoginDialog]);

  const updateMutation = useMutation({
    mutationFn: (content: string) => updatePostRequest(postId, content),
    onSuccess: (result, content) => {
      if (!result.ok) return;
      updatePostsInCache((posts) =>
        posts.map((p) =>
          p.id === postId ? { ...p, content: content.trim() } : p,
        ),
      );
      clearEditing();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePostRequest(postId),
    onSuccess: (result) => {
      if (!result.ok) return;
      updatePostsInCache((posts) => posts.filter((p) => p.id !== postId));
      if (editingPostId === postId) clearEditing();
    },
  });

  const handleStartEdit = () => {
    if (!requireAuth()) return;
    const data = queryClient.getQueryData<FeedBootstrapData>(FEED_QUERY_KEY);
    const post = data?.posts.find((p) => p.id === postId);
    if (post) startEditing(postId, post.content);
  };

  const handleSaveEdit = () => {
    if (!requireAuth()) return;
    const trimmed = editingText.trim();
    if (!trimmed) return;
    updateMutation.mutate(trimmed);
  };

  const handleDeletePost = () => {
    if (!requireAuth()) return;
    deleteMutation.mutate();
  };


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
