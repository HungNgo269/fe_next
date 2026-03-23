"use client";

import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { FeedPagination, Post } from "@/app/feature/post/types/api.types";
import { feedQueryKeys } from "./feed.query-keys";
import { mergeUniquePosts } from "@/app/feature/post/utils/postCache";

export type FeedPostsPage = {
  posts: Post[];
  pagination: FeedPagination;
};

export type FeedPostsInfiniteData = InfiniteData<FeedPostsPage>;

export function getFeedPosts(data?: FeedPostsInfiniteData): Post[] {
  if (!data) return [];

  return data.pages.reduce<Post[]>(
    (allPosts, page) => mergeUniquePosts(allPosts, page.posts),
    [],
  );
}

export function replaceFeedPosts(
  data: FeedPostsInfiniteData,
  posts: Post[],
): FeedPostsInfiniteData {
  if (data.pages.length === 0) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page, index) =>
      index === 0 ? { ...page, posts } : { ...page, posts: [] },
    ),
  };
}

export function updateFeedPosts(
  data: FeedPostsInfiniteData,
  updater: (posts: Post[]) => Post[],
): FeedPostsInfiniteData {
  return replaceFeedPosts(data, updater(getFeedPosts(data)));
}

export function prependFeedPost(
  data: FeedPostsInfiniteData,
  post: Post,
): FeedPostsInfiniteData {
  const posts = getFeedPosts(data);
  const nextPosts = posts.some((item) => item.id === post.id)
    ? posts
    : [post, ...posts];

  return replaceFeedPosts(data, nextPosts);
}

export function mergeFeedPosts(
  data: FeedPostsInfiniteData,
  incoming: Post[],
): FeedPostsInfiniteData {
  return replaceFeedPosts(data, mergeUniquePosts(getFeedPosts(data), incoming));
}

export function findFeedPost(data: FeedPostsInfiniteData | undefined, postId: string) {
  return (
    getFeedPosts(data).find((post) => post.id === postId) ??
    getFeedPosts(data).find((post) => post.sourcePostId === postId)
  );
}

export function getFeedPostsFromCache(queryClient: QueryClient): Post[] {
  return getFeedPosts(
    queryClient.getQueryData<FeedPostsInfiniteData>(feedQueryKeys.list()),
  );
}
