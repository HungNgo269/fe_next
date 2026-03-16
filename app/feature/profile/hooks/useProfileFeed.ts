"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { ProfileFeedResponse } from "../types/api.types";
import { useProfileData } from "./useProfileData";
import type { FeedBootstrapData } from "@/app/feature/feed/types/feed";
import { FEED_QUERY_KEY } from "@/app/share/hooks/feedQueryKeys";
import { useState, useCallback, useEffect, useMemo } from "react";
import type { UserProfile } from "../types/profile";
import { toast } from "sonner";

const PAGE_SIZE = 5;

export type FetchProfileFeedFn = (
  page: number,
  limit: number,
) => Promise<ApiResponse<ProfileFeedResponse>>;

export type UseProfileFeedOptions = {
  fetchFn: FetchProfileFeedFn;
  isOwnProfile?: boolean;
  profileKey?: string;
};

const toUserProfile = (
  user: ProfileFeedResponse["user"],
): UserProfile => ({
  id: user.id,
  handle: user.handle ?? null,
  name: user.name,
  email: user.email ?? "",
  gender: user.gender ?? "",
  avatar: user.avatarUrl ?? "",
  bio: user.bio ?? "",
  friendsCount: user.friendsCount,
  followersCount: user.followersCount,
  followingCount: user.followingCount,
  isFollowing: user.isFollowing,
  friendshipStatus: user.friendshipStatus,
});

export function useProfileFeed({
  fetchFn,
  isOwnProfile = false,
  profileKey = "default",
}: UseProfileFeedOptions) {
  const queryClient = useQueryClient();
  const profileData = useProfileData(isOwnProfile);
  const {
    currentUserId,
    currentUserAvatar,
    isUnauthorized,
    setIsUnauthorized,
    syncProfileToSession,
  } = profileData;
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [allPosts, setAllPosts] = useState<ProfileFeedResponse["posts"]>([]);
  const [hasMorePosts, setHasMorePosts] = useState<boolean | null>(null);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const query = useQuery({
    queryKey: ["profile-feed", isOwnProfile ? "me" : "other", profileKey],
    queryFn: async () => {
      const result = await fetchFn(1, PAGE_SIZE);
      if (!result.ok) {
        const status = (result.error as { status?: number }).status;
        setIsUnauthorized(status === 401 || status === 403);
        throw new Error("Unable to load profile.");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const profile = useMemo(
    () => (query.data ? toUserProfile(query.data.user) : profileData.profile),
    [query.data, profileData.profile],
  );
  const canEditProfile =
    Boolean(currentUserId) &&
    (isOwnProfile || (Boolean(profile.id) && currentUserId === profile.id));
  const basePosts = useMemo(() => query.data?.posts ?? [], [query.data]);
  const posts = allPosts.length > 0 ? allPosts : basePosts;
  const effectiveCurrentPage = currentPage ?? query.data?.pagination.page ?? 1;
  const effectiveHasMorePosts = hasMorePosts ?? query.data?.pagination.hasMore ?? false;
  const effectiveTotalPosts = totalPosts ?? query.data?.pagination.totalPosts ?? 0;

  useEffect(() => {
    if (!query.data) return;

    syncProfileToSession(toUserProfile(query.data.user));
    queryClient.setQueryData<FeedBootstrapData>(FEED_QUERY_KEY, (old) => {
      if (!old) return old;
      const oldIds = new Set(old.posts.map((post) => post.id));
      const mergedPosts = [...old.posts];
      for (const post of query.data.posts) {
        if (!oldIds.has(post.id)) {
          mergedPosts.push(post);
          oldIds.add(post.id);
        }
      }
      return { ...old, posts: mergedPosts } as FeedBootstrapData;
    });
  }, [query.data, queryClient, syncProfileToSession]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !effectiveHasMorePosts) return;
    setIsLoadingMore(true);

    const nextPage = effectiveCurrentPage + 1;
    const result = await fetchFn(nextPage, PAGE_SIZE);
    if (!result.ok) {
      toast.error("Unable to load more posts.");
      setIsLoadingMore(false);
      return;
    }

    setAllPosts((prev) =>
      prev.length > 0 ? [...prev, ...result.data.posts] : [...basePosts, ...result.data.posts],
    );
    setCurrentPage(result.data.pagination.page);
    setHasMorePosts(result.data.pagination.hasMore);
    setTotalPosts(result.data.pagination.totalPosts);

    // Add to feed cache for mutation hooks
    queryClient.setQueryData<FeedBootstrapData>(FEED_QUERY_KEY, (old) => {
      if (!old) return old;
      return { ...old, posts: [...old.posts, ...result.data.posts] } as FeedBootstrapData;
    });

    setIsLoadingMore(false);
  }, [isLoadingMore, effectiveHasMorePosts, effectiveCurrentPage, fetchFn, queryClient, basePosts]);

  useEffect(() => {
    if (!query.error || isUnauthorized) return;
    toast.error("Unable to load profile.");
  }, [isUnauthorized, query.error]);

  return {
    profile,
    posts,
    currentUserId,
    currentUserAvatar,
    canEditProfile,
    isLoading: query.isLoading,
    isLoadingMore,
    isUnauthorized,
    profileError: query.error?.message ?? profileData.profileError,
    hasMorePosts: effectiveHasMorePosts,
    totalPosts: effectiveTotalPosts,
    handleLoadMore,
  };
}
