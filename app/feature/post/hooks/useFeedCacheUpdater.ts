"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Post, PostComment } from "../types/api.types";
import type { FeedBootstrapData } from "../types/feed";
import { FEED_QUERY_KEY } from "./useFeedQuery";

const matchPost = (post: Post, postId: string) =>
  post.id === postId || post.sourcePostId === postId;

export function useFeedCacheUpdater() {
  const queryClient = useQueryClient();

  const updateAll = useCallback(
    (updater: (posts: Post[]) => Post[]) => {
      queryClient.setQueriesData<FeedBootstrapData>(
        { queryKey: FEED_QUERY_KEY },
        (old) => (old ? { ...old, posts: updater(old.posts) } : old),
      );
      queryClient.setQueriesData<{ posts: Post[] }>(
        { queryKey: ["profile-feed"] },
        (old) => (old ? { ...old, posts: updater(old.posts) } : old),
      );
    },
    [queryClient],
  );

  const toggleLike = useCallback(
    (postId: string, nextLiked?: boolean) => {
      updateAll((posts) =>
        posts.map((post) => {
          if (!matchPost(post, postId)) return post;
          const likedByMe = nextLiked ?? !post.likedByMe;
          const likesCount = post.likesCount + (likedByMe ? 1 : -1);
          return { ...post, likedByMe, likesCount };
        }),
      );
    },
    [updateAll],
  );

  const appendComment = useCallback(
    (postId: string, comment: PostComment) => {
      queryClient.setQueryData<PostComment[]>(
        ["post-comments", postId],
        (old) => (old ? [...old, comment] : [comment]),
      );
      updateAll((posts) =>
        posts.map((post) =>
          matchPost(post, postId)
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post,
        ),
      );
    },
    [queryClient, updateAll],
  );

  const updateComment = useCallback(
    (postId: string, commentId: string, patch: Partial<PostComment>) => {
      queryClient.setQueryData<PostComment[]>(
        ["post-comments", postId],
        (old) =>
          old
            ? old.map((c) => (c.id === commentId ? { ...c, ...patch } : c))
            : old,
      );
    },
    [queryClient],
  );

  const removeComment = useCallback(
    (postId: string, commentId: string) => {
      queryClient.setQueryData<PostComment[]>(
        ["post-comments", postId],
        (old) => (old ? old.filter((c) => c.id !== commentId) : old),
      );
      updateAll((posts) =>
        posts.map((post) =>
          matchPost(post, postId)
            ? { ...post, commentsCount: Math.max(0, post.commentsCount - 1) }
            : post,
        ),
      );
    },
    [queryClient, updateAll],
  );

  const updatePostContent = useCallback(
    (postId: string, content: string) => {
      updateAll((posts) =>
        posts.map((post) =>
          matchPost(post, postId) ? { ...post, content: content.trim() } : post,
        ),
      );
    },
    [updateAll],
  );

  const removePost = useCallback(
    (postId: string) => {
      updateAll((posts) => posts.filter((post) => post.id !== postId));
    },
    [updateAll],
  );

  const prependPost = useCallback(
    (post: Post) => {
      updateAll((posts) => [post, ...posts]);
    },
    [updateAll],
  );

  const prependProfilePost = useCallback(
    (post: Post) => {
      queryClient.setQueriesData<{ posts: Post[] }>(
        { queryKey: ["profile-feed"] },
        (old) => (old ? { ...old, posts: [post, ...old.posts] } : old),
      );
    },
    [queryClient],
  );

  return {
    updateAll,
    toggleLike,
    appendComment,
    updateComment,
    removeComment,
    updatePostContent,
    removePost,
    prependPost,
    prependProfilePost,
  };
}
