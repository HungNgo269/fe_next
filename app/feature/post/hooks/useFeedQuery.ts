"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "../api/postApi";
import type { FeedBootstrapData } from "../types/feed";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";
import { useEffect } from "react";
import { fetchCurrentUser } from "@/app/share/api/userApi";

export const FEED_QUERY_KEY = ["feed-bootstrap"] as const;

export function useFeedQuery() {
  const setAuthenticatedProfile = useAppSessionStore(
    (state) => state.setAuthenticatedProfile,
  );
  const clearAuthenticatedProfile = useAppSessionStore(
    (state) => state.clearAuthenticatedProfile,
  );

  const query = useQuery<FeedBootstrapData>({
    queryKey: FEED_QUERY_KEY,
    queryFn: async () => {
      const [userResult, postsResult] = await Promise.all([
        fetchCurrentUser(),
        fetchPosts(),
      ]);

      const userData = userResult.ok
        ? userResult.data
        : {
            currentUser: null,
            currentUserProfile: null,
            isAuthenticated: false,
          };

      const posts = postsResult.ok ? postsResult.data : [];

      return { ...userData, posts };
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

  return query;
}
