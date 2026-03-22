"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Post, PostComment } from "../types/api.types";
import { fetchCommentsByPostId } from "../api/postCommentApi";
import { useCommentActions } from "./useCommentActions";
import { useLikeActions } from "./useLikeActions";
import { usePostActions } from "./usePostActions";
import { useSharePost } from "./useSharePost";
import { postQueryKeys } from "../queries/post.query-keys";
import { useModalLifecycle } from "./useModalLifecycle";
import type { ModalPostContentProviderValue } from "../interface/modal-post-content.interface";

interface UseModalPostContentViewModelParams {
  post: Post;
  onClose: () => void;
}

export function useModalPostContentViewModel({
  post,
  onClose,
}: UseModalPostContentViewModelParams): {
  contentRef: React.RefObject<HTMLDivElement | null>;
  providerValue: ModalPostContentProviderValue;
} {
  const postId = post.sourcePostId ?? post.id;

  const { data: comments = [], isLoading: commentsLoading } = useQuery<
    PostComment[]
  >({
    queryKey: postQueryKeys.comments(postId),
    queryFn: async () => {
      const result = await fetchCommentsByPostId(postId, true);
      return result.ok ? result.data : [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const [visibleRootCount, setVisibleRootCount] = useState(10);

  const sortedRootComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [comments],
  );

  const visibleRootComments = useMemo(
    () => sortedRootComments.slice(0, visibleRootCount),
    [sortedRootComments, visibleRootCount],
  );
  const hasMoreRootComments = visibleRootCount < sortedRootComments.length;

  const totalComments = useMemo(
    () => comments.reduce((acc, root) => acc + 1 + (root.replies?.length ?? 0), 0),
    [comments],
  );

  const showMoreRootComments = () =>
    setVisibleRootCount((prev) => Math.min(prev + 10, sortedRootComments.length));

  const { contentRef } = useModalLifecycle(onClose);

  const { handleToggleLike } = useLikeActions(postId, post.likedByMe);
  const { handleCopyShareLink } = useSharePost(postId);
  const {
    isEditing,
    editingText,
    setEditingText,
    handleSaveEdit,
    handleCancelEdit,
    isOwner,
    handleStartEdit,
    handleDeletePost,
    isReportingPost,
    handleReportPost,
  } = usePostActions(postId);

  const { commentDraft, setCommentDraft, handleAddComment } =
    useCommentActions(postId);

  const author = post.author ?? {
    id: "unknown-user",
    name: "Unknown user",
    email: "unknown@example.com",
    handle: null,
    avatarUrl: null,
    gender: undefined,
  };

  const normalizedPost: Post = { ...post, author };
  const fallback = author.email.split("@")[0] ?? "user";
  const userHandle = author.handle || fallback;
  const profileKey = author.handle || author.id;

  const providerValue: ModalPostContentProviderValue = {
    post: normalizedPost,
    postId,
    profileKey,
    userHandle,
    onClose,
    isOwner,
    isEditing,
    editingText,
    setEditingText,
    handleSaveEdit,
    handleCancelEdit,
    handleStartEdit,
    handleDeletePostAndClose: () => {
      handleDeletePost();
      onClose();
    },
    handleReportPost,
    isReportingPost,
    commentsLoading,
    visibleRootComments,
    hasMoreRootComments,
    showMoreRootComments,
    likesCount: normalizedPost.likesCount,
    likedByMe: normalizedPost.likedByMe,
    totalComments,
    handleToggleLike,
    handleShare: () => void handleCopyShareLink(),
    commentDraft,
    setCommentDraft,
    handleAddComment,
  };

  return {
    contentRef,
    providerValue,
  };
}

