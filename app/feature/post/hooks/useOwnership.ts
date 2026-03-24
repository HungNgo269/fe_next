"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getFeedPostsFromCache } from "@/app/feature/feed/queries/feed.cache";
import { useUser } from "@/app/share/providers/UserProvider";
import { postQueryKeys } from "../queries/post.query-keys";
import type { Post, PostComment } from "../types/api.types";

export function useOwnership() {
  const queryClient = useQueryClient();
  const currentUserId = useUser()?.id ?? "";

  const getPosts = useCallback(
    (posts?: Post[]) => posts ?? getFeedPostsFromCache(queryClient),
    [queryClient],
  );

  const isOwnerByUserId = useCallback(
    (authorId?: string | null) =>
      Boolean(currentUserId) && Boolean(authorId) && currentUserId === authorId,
    [currentUserId],
  );

  const isPostOwner = useCallback(
    (postId: string, posts?: Post[]) =>
      isOwnerByUserId(
        getPosts(posts).find(
          (post) => post.id === postId || post.sourcePostId === postId,
        )?.author.id,
      ),
    [getPosts, isOwnerByUserId],
  );

  const isCommentOwner = useCallback(
    (postId: string, commentId: string) => {
      const comments =
        queryClient.getQueryData<PostComment[]>(postQueryKeys.comments(postId)) ?? [];
      const comment = comments.find(
        (root) =>
          root.id === commentId ||
          root.replies?.some((reply) => reply.id === commentId),
      );
      const ownerId =
        comment?.id === commentId
          ? comment.author.id
          : comment?.replies?.find((reply) => reply.id === commentId)?.author.id;
      return isOwnerByUserId(ownerId);
    },
    [queryClient, isOwnerByUserId],
  );

  return { currentUserId, isOwnerByUserId, isPostOwner, isCommentOwner };
}
