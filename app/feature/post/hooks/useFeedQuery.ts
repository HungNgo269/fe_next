"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "../api/postApi";
import type { FeedBootstrapData } from "../types/feed";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";
import { useCallback, useEffect, useState } from "react";
import { fetchCurrentUser } from "@/app/share/api/userApi";
import { useQueryClient } from "@tanstack/react-query";
import { FEED_PAGE_SIZE, FEED_QUERY_KEY } from "./feedQueryKeys";

export function useFeedQuery() {
  const queryClient = useQueryClient();
  const setAuthenticatedProfile = useAppSessionStore(
    (state) => state.setAuthenticatedProfile,
  );
  const clearAuthenticatedProfile = useAppSessionStore(
    (state) => state.clearAuthenticatedProfile,
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [postsError, setPostsError] = useState("");

  const query = useQuery<FeedBootstrapData>({
    queryKey: FEED_QUERY_KEY,
    queryFn: async () => {
      const [userResult, postsResult] = await Promise.all([
        fetchCurrentUser(),
        fetchPosts(1, FEED_PAGE_SIZE),
      ]);

      const userData = userResult.ok
        ? userResult.data
        : {
            currentUser: null,
            currentUserProfile: null,
            isAuthenticated: false,
          };

      if (!postsResult.ok) {
        throw new Error(postsResult.error.messages[0] ?? "Unable to load feed.");
      }

      return {
        ...userData,
        posts: postsResult.data.posts,
        pagination: postsResult.data.pagination,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!query.data) return;
    if (query.data.currentUserProfile) {
      setAuthenticatedProfile(query.data.currentUserProfile);
    } else {
      clearAuthenticatedProfile();
    }
  }, [query.data, setAuthenticatedProfile, clearAuthenticatedProfile]);

  const pagination = query.data?.pagination;
  const hasMorePosts = pagination?.hasMore ?? false;

  const handleLoadMore = useCallback(async () => {
    if (
      isLoadingMore ||
      query.isLoading ||
      !hasMorePosts ||
      !query.data ||
      !pagination
    ) {
      return;
    }
    setIsLoadingMore(true);
    setPostsError("");

    const nextPage = pagination.page + 1;
    const result = await fetchPosts(nextPage, FEED_PAGE_SIZE);

    if (!result.ok) {
      setPostsError(result.error.messages[0] ?? "Unable to load more posts.");
      setIsLoadingMore(false);
      return;
    }

    queryClient.setQueryData<FeedBootstrapData>(FEED_QUERY_KEY, (old) => {
      if (!old) return old;
      const postIds = new Set(old.posts.map((post) => post.id));
      const mergedPosts = [...old.posts];
      for (const post of result.data.posts) {
        if (!postIds.has(post.id)) {
          mergedPosts.push(post);
          postIds.add(post.id);
        }
      }

      return {
        ...old,
        posts: mergedPosts,
        pagination: result.data.pagination,
      } as FeedBootstrapData;
    });

    setIsLoadingMore(false);
  }, [hasMorePosts, isLoadingMore, pagination, query.data, query.isLoading, queryClient]);

  return {
    ...query,
    posts: query.data?.posts ?? [],
    hasMorePosts,
    isLoadingMore,
    postsError,
    handleLoadMore,
  };
}
