"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { ProfileFeedResponse } from "../types/api.types";
import {
  mergeFeedPosts,
  type FeedPostsInfiniteData,
} from "@/app/feature/feed/queries/feed.cache";
import { feedQueryKeys } from "@/app/feature/feed/queries/feed.query-keys";
import { profileQueryKeys } from "./profile.query-keys";
import type { UserProfile } from "../types/profile";
import { mergeUniquePosts } from "@/app/feature/post/utils/postCache";
import { toast } from "sonner";
import {
  toAvatarFromProfile,
  useAppSessionStore,
} from "@/app/share/stores/appSessionStore";

const PAGE_SIZE = 5;
type ProfileFeedQueryError = Error & { status?: number };

type ProfileFeedState = Pick<ProfileFeedResponse, "posts" | "pagination">;

export type FetchProfileFeedFn = (
  page: number,
  limit: number,
) => Promise<ApiResponse<ProfileFeedResponse>>;

export type UseProfileFeedQueryOptions = {
  fetchFn: FetchProfileFeedFn;
  isOwnProfile?: boolean;
  profileKey?: string;
};

const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  gender: "",
  avatar: "",
  bio: "",
  followersCount: 0,
  followingCount: 0,
  isFollowing: false,
};

const toUserProfile = (user: ProfileFeedResponse["user"]): UserProfile => ({
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

export function useProfileFeedQuery({
  fetchFn,
  isOwnProfile = false,
  profileKey = "default",
}: UseProfileFeedQueryOptions) {
  const queryClient = useQueryClient();
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const setAuthenticatedProfile = useAppSessionStore(
    (state) => state.setAuthenticatedProfile,
  );
  const currentUserId = authProfile?.id ?? "";
  const currentUserAvatar = useMemo(
    () => toAvatarFromProfile(authProfile),
    [authProfile],
  );
  const [profileError, setProfileError] = useState("");
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [loadedFeed, setLoadedFeed] = useState<ProfileFeedState | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const syncProfileToSession = useCallback(
    (incoming: UserProfile) => {
      if (isOwnProfile && incoming.id) {
        setAuthenticatedProfile({
          id: incoming.id,
          handle: incoming.handle ?? null,
          name: incoming.name,
          email: incoming.email,
          gender: incoming.gender,
          avatar: incoming.avatar,
          bio: incoming.bio,
          followersCount: incoming.followersCount,
          followingCount: incoming.followingCount,
          isFollowing: incoming.isFollowing,
        });
      }
    },
    [isOwnProfile, setAuthenticatedProfile],
  );

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

  useEffect(() => {
    if (!query.data) {
      return;
    }

    const nextProfile = toUserProfile(query.data.user);
    setProfile(nextProfile);
    setProfileError("");
    setIsUnauthorized(false);
    syncProfileToSession(nextProfile);
    queryClient.setQueryData<FeedPostsInfiniteData>(feedQueryKeys.list(), (old) =>
      old ? mergeFeedPosts(old, query.data.posts) : old,
    );
  }, [query.data, queryClient, syncProfileToSession]);

  useEffect(() => {
    if (!query.error) {
      return;
    }

    const status = (query.error as ProfileFeedQueryError).status;
    setIsUnauthorized(status === 401 || status === 403);
    setProfileError(query.error.message);
  }, [query.error]);

  useEffect(() => {
    if (!query.error || isUnauthorized) {
      return;
    }

    toast.error("Unable to load profile.");
  }, [isUnauthorized, query.error]);

  const resolvedProfile = useMemo(
    () => (query.data ? toUserProfile(query.data.user) : profile),
    [profile, query.data],
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
    (isOwnProfile || (Boolean(resolvedProfile.id) && currentUserId === resolvedProfile.id));
  const posts = feed?.posts ?? [];
  const pagination = feed?.pagination;

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination?.hasMore) {
      return;
    }

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

      queryClient.setQueryData<FeedPostsInfiniteData>(
        feedQueryKeys.list(),
        (old) => (old ? mergeFeedPosts(old, result.data.posts) : old),
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [feed, fetchFn, isLoadingMore, pagination, queryClient]);

  return {
    profile: resolvedProfile,
    posts,
    currentUserId,
    currentUserAvatar,
    canEditProfile,
    isLoading: query.isLoading,
    isLoadingMore,
    isUnauthorized,
    profileError,
    hasMorePosts: pagination?.hasMore ?? false,
    totalPosts: pagination?.totalPosts ?? posts.length,
    handleLoadMore,
  };
}
