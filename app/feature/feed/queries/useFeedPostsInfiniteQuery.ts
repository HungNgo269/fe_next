"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/app/feature/post/api/postApi";
import type { FeedPagination, Post } from "@/app/feature/post/types/api.types";
import { FEED_PAGE_SIZE, feedQueryKeys } from "./feed.query-keys";
import type { FeedPostsInfiniteData, FeedPostsPage } from "./feed.cache";
import { getFeedPosts } from "./feed.cache";

type UseFeedPostsInfiniteQueryOptions = {
  initialPosts: Post[];
  initialPagination: FeedPagination;
};

export function useFeedPostsInfiniteQuery({
  initialPosts,
  initialPagination,
}: UseFeedPostsInfiniteQueryOptions) {
  const query = useInfiniteQuery({
    queryKey: feedQueryKeys.list(),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await fetchPosts(pageParam, FEED_PAGE_SIZE);
      if (!result.ok) {
        throw new Error(result.error.messages[0] ?? "Unable to load feed.");
      }

      return {
        posts: result.data.posts,
        pagination: result.data.pagination,
      } satisfies FeedPostsPage;
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialData: {
      pages: [
        {
          posts: initialPosts,
          pagination: initialPagination,
        },
      ],
      pageParams: [1],
    } satisfies FeedPostsInfiniteData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    posts: getFeedPosts(query.data),
    hasMore: query.hasNextPage,
  };
}
