"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Post, PostComment } from "../types/api.types";
import type { FeedBootstrapData } from "../types/feed";
import { FEED_QUERY_KEY } from "./useFeedQuery";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";

export function useOwnership() {
  const queryClient = useQueryClient();
  const currentUserId = useAppSessionStore((state) => state.authProfile?.id ?? "");

  const getPosts = useCallback(
    (posts?: Post[]) =>
      posts ??
      queryClient.getQueryData<FeedBootstrapData>(FEED_QUERY_KEY)?.posts ??
      [],
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
        getPosts(posts).find((post) => post.id === postId || post.sourcePostId === postId)
          ?.author.id,
      ),
    [getPosts, isOwnerByUserId],
  );

  /** Check comment ownership from the lazy-loaded comments cache. */
  const isCommentOwner = useCallback(
    (postId: string, commentId: string) => {
      const comments =
        queryClient.getQueryData<PostComment[]>(["post-comments", postId]) ?? [];
      const comment = comments.find(
        (root) => root.id === commentId || root.replies?.some((reply) => reply.id === commentId),
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
