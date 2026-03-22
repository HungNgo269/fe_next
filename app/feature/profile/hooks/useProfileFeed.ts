"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { ProfileFeedResponse } from "../types/api.types";
import { useProfileData } from "./useProfileData";
import type { FeedBootstrapData } from "@/app/feature/feed/types/feed";
import { feedQueryKeys } from "@/app/feature/feed/queries/feed.query-keys";
import { profileQueryKeys } from "../queries/profile.query-keys";
import { useState, useCallback, useEffect, useMemo } from "react";
import type { UserProfile } from "../types/profile";
import { mergeUniquePosts } from "@/app/feature/post/utils/postCache";
import { toast } from "sonner";

const PAGE_SIZE = 5;
type ProfileFeedQueryError = Error & { status?: number };

type ProfileFeedState = Pick<ProfileFeedResponse, "posts" | "pagination">;

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
  const [loadedFeed, setLoadedFeed] = useState<ProfileFeedState | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const query = useQuery({
    queryKey: profileQueryKeys.detail(isOwnProfile ? "me" : "other", profileKey),
    queryFn: async () => {
      const result = await fetchFn(1, PAGE_SIZE);
      if (!result.ok) {
        const error = new Error("Unable to load profile.") as ProfileFeedQueryError;
        error.status = (result.error as { status?: number }).status;
        throw error;
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setLoadedFeed(null);
  }, [isOwnProfile, profileKey]);

  const profile = useMemo(
    () => (query.data ? toUserProfile(query.data.user) : profileData.profile),
    [query.data, profileData.profile],
  );

  const feed = useMemo<ProfileFeedState | null>(() => {
    if (loadedFeed) {
      return loadedFeed;
    }
    if (!query.data) {
      return null;
    }
    return {
      posts: query.data.posts,
      pagination: query.data.pagination,
    };
  }, [loadedFeed, query.data]);

  const canEditProfile =
    Boolean(currentUserId) &&
    (isOwnProfile || (Boolean(profile.id) && currentUserId === profile.id));
  const posts = feed?.posts ?? [];
  const pagination = feed?.pagination;

  useEffect(() => {
    if (!query.data) return;

    setIsUnauthorized(false);
    syncProfileToSession(toUserProfile(query.data.user));
    queryClient.setQueryData<FeedBootstrapData>(feedQueryKeys.all, (old) => {
      if (!old) return old;
      return {
        ...old,
        posts: mergeUniquePosts(old.posts, query.data.posts),
      } as FeedBootstrapData;
    });
  }, [query.data, queryClient, setIsUnauthorized, syncProfileToSession]);

  useEffect(() => {
    if (!query.error) return;
    const status = (query.error as ProfileFeedQueryError).status;
    setIsUnauthorized(status === 401 || status === 403);
  }, [query.error, setIsUnauthorized]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination?.hasMore) return;

    setIsLoadingMore(true);
    try {
      const result = await fetchFn(pagination.page + 1, PAGE_SIZE);
      if (!result.ok) {
        toast.error("Unable to load more posts.");
        return;
      }

      setLoadedFeed((current) => {
        const base = current ?? feed;
        if (!base) {
          return {
            posts: result.data.posts,
            pagination: result.data.pagination,
          };
        }

        return {
          posts: mergeUniquePosts(base.posts, result.data.posts),
          pagination: result.data.pagination,
        };
      });

      queryClient.setQueryData<FeedBootstrapData>(feedQueryKeys.all, (old) => {
        if (!old) return old;
        return {
          ...old,
          posts: mergeUniquePosts(old.posts, result.data.posts),
        } as FeedBootstrapData;
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [feed, fetchFn, isLoadingMore, pagination, queryClient]);

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
    hasMorePosts: pagination?.hasMore ?? false,
    totalPosts: pagination?.totalPosts ?? posts.length,
    handleLoadMore,
  };
}
