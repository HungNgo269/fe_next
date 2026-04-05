"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getUserProfileFeed } from "../api/profileApi";
import { mergeFeedPosts, type FeedPostsInfiniteData } from "@/app/feature/feed/queries/feed.cache";
import { feedQueryKeys } from "@/app/feature/feed/queries/feed.query-keys";
import { mergeUniquePosts } from "@/app/feature/post/utils/postCache";
import {
  OK_ACCESS_STATE,
  getAccessStateFromStatus,
  type AccessState,
} from "@/app/share/utils/access-state";
import type { ProfileFeedResponse } from "../types/api.types";
import { profileQueryKeys } from "./profile.query-keys";
import type { UserProfile } from "../types/profile";

const PAGE_SIZE = 5;
type ProfileFeedQueryError = Error & { status?: number };
type ProfileFeedState = Pick<ProfileFeedResponse, "posts" | "pagination">;

type UseProfileFeedQueryOptions = {
  profileKey: string;
  viewerId?: string | null;
  initialAccessState?: AccessState;
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
  profileKey,
  viewerId,
  initialAccessState = OK_ACCESS_STATE,
}: UseProfileFeedQueryOptions) {
  const queryClient = useQueryClient();
  const currentUserId = viewerId ?? "";
  const [profileError, setProfileError] = useState("");
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [accessState, setAccessState] = useState<AccessState>(initialAccessState);
  const [loadedFeed, setLoadedFeed] = useState<ProfileFeedState | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const query = useQuery({
    queryKey: profileQueryKeys.detail(profileKey),
    queryFn: async () => {
      const result = await getUserProfileFeed(profileKey, 1, PAGE_SIZE);
      if (!result.ok) {
        const error = new Error("Unable to load profile.") as ProfileFeedQueryError;
        error.status = (result.error as { status?: number }).status;
        throw error;
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: initialAccessState.kind === "ok",
  });

  useEffect(() => {
    setLoadedFeed(null);
    setProfileError("");
    setAccessState(initialAccessState);
  }, [initialAccessState, profileKey]);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    setProfile(toUserProfile(query.data.user));
    setProfileError("");
    setAccessState(OK_ACCESS_STATE);
    queryClient.setQueryData<FeedPostsInfiniteData>(feedQueryKeys.list(), (old) =>
      old ? mergeFeedPosts(old, query.data.posts) : old,
    );
  }, [query.data, queryClient]);

  useEffect(() => {
    if (!query.error) {
      return;
    }

    const status = (query.error as ProfileFeedQueryError).status;
    const nextAccessState = getAccessStateFromStatus(status, query.error.message);
    setAccessState(nextAccessState);
    setProfileError(nextAccessState.kind === "error" ? query.error.message : "");
  }, [query.error]);

  useEffect(() => {
    if (!query.error || accessState.kind !== "error") {
      return;
    }

    toast.error("Unable to load profile.");
  }, [accessState.kind, query.error]);

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
    (profileKey === "me" ||
      (Boolean(resolvedProfile.id) && currentUserId === resolvedProfile.id));
  const posts = feed?.posts ?? [];
  const pagination = feed?.pagination;

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination?.hasMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const result = await getUserProfileFeed(profileKey, pagination.page + 1, PAGE_SIZE);
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
  }, [feed, isLoadingMore, pagination, profileKey, queryClient]);

  return {
    profile: resolvedProfile,
    posts,
    currentUserId,
    canEditProfile,
    isLoading: initialAccessState.kind === "ok" ? query.isLoading : false,
    isLoadingMore,
    accessState,
    profileError,
    hasMorePosts: pagination?.hasMore ?? false,
    totalPosts: pagination?.totalPosts ?? posts.length,
    handleLoadMore,
  };
}
