"use client";

import { useCallback } from "react";
import { usePostUIStore } from "@/app/feature/post/stores/postStore";
import { useInfiniteScrollTrigger } from "@/app/share/hooks/useInfiniteScrollTrigger";
import type { FeedPagination, Post, User } from "@/app/feature/post/types/api.types";
import { useFeedPostsInfiniteQuery } from "../queries/useFeedPostsInfiniteQuery";

type UseFeedPageControllerOptions = {
  currentUser: User | null;
  initialPosts: Post[];
  initialPagination: FeedPagination;
  feedError?: string;
};

export function useFeedPageController({
  currentUser,
  initialPosts,
  initialPagination,
  feedError,
}: UseFeedPageControllerOptions) {
  const query = useFeedPostsInfiniteQuery({
    initialPosts,
    initialPagination,
  });
  const showLoginDialog = usePostUIStore((state) => state.showLoginDialog);
  const setShowLoginDialog = usePostUIStore((state) => state.setShowLoginDialog);

  const handleLoadMore = useCallback(() => {
    if (!query.hasMore || query.isFetchingNextPage) return;
    void query.fetchNextPage();
  }, [query]);

  const loadMoreSentinelRef = useInfiniteScrollTrigger({
    hasMore: query.hasMore,
    isLoading: query.isFetchingNextPage,
    onLoadMore: handleLoadMore,
    rootMargin: "240px 0px",
  });

  return {
    currentUser,
    posts: query.posts,
    feedError,
    hasMore: query.hasMore,
    isLoadingMore: query.isFetchingNextPage,
    loadMoreSentinelRef,
    showLoginDialog,
    closeLoginDialog: () => setShowLoginDialog(false),
  };
}
