"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Post, PostComment } from "../types/api.types";
import { fetchCommentsByPostId } from "../api/postCommentApi";
import { useCommentActions } from "../hooks/useCommentActions";
import { useLikeActions } from "../hooks/useLikeActions";
import { usePostActions } from "../hooks/usePostActions";
import { useSharePost } from "../hooks/useSharePost";
import { commentQueryKey } from "./PostDetailModal";
import { useModalLifecycle } from "../hooks/useModalLifecycle";
import ModalPostLeftPane from "./modal/ModalPostLeftPane";
import ModalPostHeader from "./modal/ModalPostHeader";
import ModalPostBody from "./modal/ModalPostBody";
import ModalPostComments from "./modal/ModalPostComments";
import ModalPostActions from "./modal/ModalPostActions";
import ModalPostComposer from "./modal/ModalPostComposer";
import { ModalPostContentProvider } from "./modal/ModalPostContentContext";

export default function ModalPostContent({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  const postId = post.sourcePostId ?? post.id;

  const { data: comments = [], isLoading: commentsLoading } = useQuery<
    PostComment[]
  >({
    queryKey: commentQueryKey(postId),
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

  const visibleRootComments = sortedRootComments.slice(0, visibleRootCount);
  const hasMoreRootComments = visibleRootCount < sortedRootComments.length;

  const totalComments = comments.reduce(
    (acc, root) => acc + 1 + (root.replies?.length ?? 0),
    0,
  );

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
  } = usePostActions(postId);

  const { commentDraft, setCommentDraft, handleAddComment } =
    useCommentActions(postId);

  const author = post.author;
  const fallback = author.email.split("@")[0] ?? "user";
  const userHandle = author.handle || fallback;
  const profileKey = author.handle || author.id;
  const showMoreRootComments = () =>
    setVisibleRootCount((prev) =>
      Math.min(prev + 10, sortedRootComments.length),
    );

  return (
    <div className="post-detail-overlay">
      <div className="post-detail-container" ref={contentRef}>
        <ModalPostContentProvider
          value={{
            post,
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
            commentsLoading,
            visibleRootComments,
            hasMoreRootComments,
            showMoreRootComments,
            likesCount: post.likesCount,
            likedByMe: post.likedByMe,
            totalComments,
            handleToggleLike,
            handleShare: () => void handleCopyShareLink(),
            commentDraft,
            setCommentDraft,
            handleAddComment,
          }}
        >
          <ModalPostLeftPane />
          <div className="post-detail-right">
            <ModalPostHeader />
            <ModalPostBody />
            <ModalPostComments />
            <ModalPostActions />
            <ModalPostComposer />
          </div>
        </ModalPostContentProvider>
      </div>
    </div>
  );
}
