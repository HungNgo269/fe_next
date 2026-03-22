"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Post, PostComment } from "@/app/feature/post/types/api.types";
import type { FeedBootstrapData } from "@/app/feature/feed/types/feed";
import { feedQueryKeys } from "@/app/feature/feed/queries/feed.query-keys";
import { profileQueryKeys } from "@/app/feature/profile/queries/profile.query-keys";
import { postQueryKeys } from "@/app/feature/post/queries/post.query-keys";
import { usePostDetailModal } from "@/app/feature/post/hooks/usePostDetailModal";

const matchPost = (post: Post, postId: string) =>
  post.id === postId || post.sourcePostId === postId;

export function useFeedCacheUpdater() {
  const queryClient = useQueryClient();

  const syncModalSelectedPost = useCallback(() => {
    const selectedPost = usePostDetailModal.getState().selectedPost;
    if (!selectedPost) return;

    const interactionPostId = selectedPost.sourcePostId ?? selectedPost.id;
    const feedData = queryClient.getQueryData<FeedBootstrapData>(feedQueryKeys.all);
    const fromFeed =
      feedData?.posts.find((p) => p.id === selectedPost.id) ??
      feedData?.posts.find((p) => matchPost(p, interactionPostId));

    if (fromFeed) {
      usePostDetailModal.setState({ selectedPost: fromFeed });
      return;
    }

    const profileCaches = queryClient.getQueriesData<{ posts: Post[] }>({
      queryKey: profileQueryKeys.all,
    });
    for (const [, data] of profileCaches) {
      const fromProfile =
        data?.posts.find((p) => p.id === selectedPost.id) ??
        data?.posts.find((p) => matchPost(p, interactionPostId));
      if (fromProfile) {
        usePostDetailModal.setState({ selectedPost: fromProfile });
        return;
      }
    }
  }, [queryClient]);

  const updateAll = useCallback(
    (updater: (posts: Post[]) => Post[]) => {
      queryClient.setQueriesData<FeedBootstrapData>(
        { queryKey: feedQueryKeys.all },
        (old) => (old ? { ...old, posts: updater(old.posts) } : old),
      );
      queryClient.setQueriesData<{ posts: Post[] }>(
        { queryKey: profileQueryKeys.all },
        (old) => (old ? { ...old, posts: updater(old.posts) } : old),
      );
      syncModalSelectedPost();
    },
    [queryClient, syncModalSelectedPost],
  );

  const toggleLike = useCallback(
    (postId: string, nextLiked?: boolean) => {
      updateAll((posts) =>
        posts.map((post) => {
          if (!matchPost(post, postId)) return post;
          const likedByMe = nextLiked ?? !post.likedByMe;
          const delta =
            likedByMe === post.likedByMe ? 0 : likedByMe ? 1 : -1;
          const likesCount = Math.max(0, post.likesCount + delta);
          return { ...post, likedByMe, likesCount };
        }),
      );
    },
    [updateAll],
  );

  const appendComment = useCallback(
    (postId: string, comment: PostComment) => {
      queryClient.setQueryData<PostComment[]>(
        postQueryKeys.comments(postId),
        (old) => {
          if (!old) return [comment];
          if (!comment.parentId) return [...old, comment];

          let attached = false;
          const next = old.map((root) => {
            if (root.id !== comment.parentId) return root;
            attached = true;
            const nextCount = root._count
              ? { replies: root._count.replies + 1 }
              : { replies: (root.replies?.length ?? 0) + 1 };
            return {
              ...root,
              replies: [...(root.replies ?? []), comment],
              _count: nextCount,
            };
          });
          return attached ? next : [...old, comment];
        },
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

  const appendReplies = useCallback(
    (postId: string, commentId: string, newReplies: PostComment[]) => {
      if (newReplies.length === 0) return;
      queryClient.setQueryData<PostComment[]>(
        postQueryKeys.comments(postId),
        (old) => {
          if (!old) return old;
          return old.map((root) => {
            if (root.id !== commentId) return root;

            const existingIds = new Set(root.replies?.map((r) => r.id) || []);
            const uniqueNew = newReplies.filter((r) => !existingIds.has(r.id));

            return {
              ...root,
              replies: [...(root.replies ?? []), ...uniqueNew],
            };
          });
        },
      );
    },
    [queryClient],
  );

  const updateComment = useCallback(
    (postId: string, commentId: string, patch: Partial<PostComment>) => {
      queryClient.setQueryData<PostComment[]>(
        postQueryKeys.comments(postId),
        (old) => {
          if (!old) return old;
          return old.map((root) => {
            if (root.id === commentId) return { ...root, ...patch };
            const replies = root.replies ?? [];
            const nextIndex = replies.findIndex(
              (reply) => reply.id === commentId,
            );
            if (nextIndex === -1) return root;
            const updatedReplies = replies.map((reply) =>
              reply.id === commentId ? { ...reply, ...patch } : reply,
            );
            return { ...root, replies: updatedReplies };
          });
        },
      );
    },
    [queryClient],
  );

  const removeComment = useCallback(
    (postId: string, commentId: string) => {
      let removedCount = 0;
      queryClient.setQueryData<PostComment[]>(
        postQueryKeys.comments(postId),
        (old) => {
          if (!old) return old;

          const remaining: PostComment[] = [];
          for (const root of old) {
            if (root.id === commentId) {
              removedCount += 1 + (root.replies?.length ?? 0);
              continue;
            }

            const replies = root.replies ?? [];
            const filteredReplies = replies.filter(
              (reply) => reply.id !== commentId,
            );
            if (filteredReplies.length !== replies.length) {
              removedCount += replies.length - filteredReplies.length;
              const nextCount = root._count
                ? { replies: Math.max(0, root._count.replies - 1) }
                : { replies: filteredReplies.length };

              remaining.push({
                ...root,
                replies: filteredReplies,
                _count: nextCount,
              });
              continue;
            }

            remaining.push(root);
          }

          return remaining;
        },
      );
      if (removedCount === 0) return;
      updateAll((posts) =>
        posts.map((post) =>
          matchPost(post, postId)
            ? {
                ...post,
                commentsCount: Math.max(0, post.commentsCount - removedCount),
              }
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
        { queryKey: profileQueryKeys.all },
        (old) => (old ? { ...old, posts: [post, ...old.posts] } : old),
      );
    },
    [queryClient],
  );

  return {
    updateAll,
    toggleLike,
    appendComment,
    appendReplies,
    updateComment,
    removeComment,
    updatePostContent,
    removePost,
    prependPost,
    prependProfilePost,
  };
}


