"use client";

import { useQueryClient } from "@tanstack/react-query";
import { followUserApi, unfollowUserApi } from "../api/profileApi";
import type { ProfileFeedResponse } from "../types/api.types";
import { useSafeOptimisticMutation } from "@/app/share/hooks/useSafeOptimisticMutation";

export const useFollowUser = (userId: string, profileKey: string) => {
  const queryClient = useQueryClient();
  const profileQueryKey = ["profile-feed", "other", profileKey] as const;

  const handleOptimisticUpdate = (isFollowing: boolean) => {
    queryClient.setQueryData(
      profileQueryKey,
      (old: ProfileFeedResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          user: {
            ...old.user,
            isFollowing,
            followersCount: Math.max(0, old.user.followersCount + (isFollowing ? 1 : -1)),
          }
        };
      },
    );
  };

  const followMutation = useSafeOptimisticMutation<void, void, ProfileFeedResponse | undefined>({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await followUserApi(userId);
      if (!result.ok && result.error.status !== 409) {
        throw new Error(result.error.messages[0] ?? "Unable to follow user.");
      }
    },
    getSnapshot: () => queryClient.getQueryData<ProfileFeedResponse>(profileQueryKey),
    applyOptimistic: () => {
      handleOptimisticUpdate(true);
    },
    rollback: (snapshot) => {
      queryClient.setQueryData(profileQueryKey, snapshot);
    },
    refetchType: "inactive",
  });

  const unfollowMutation = useSafeOptimisticMutation<void, void, ProfileFeedResponse | undefined>({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await unfollowUserApi(userId);
      if (!result.ok && result.error.status !== 404) {
        throw new Error(result.error.messages[0] ?? "Unable to unfollow user.");
      }
    },
    getSnapshot: () => queryClient.getQueryData<ProfileFeedResponse>(profileQueryKey),
    applyOptimistic: () => {
      handleOptimisticUpdate(false);
    },
    rollback: (snapshot) => {
      queryClient.setQueryData(profileQueryKey, snapshot);
    },
    refetchType: "inactive",
  });

  return {
    followUser: followMutation.mutate,
    unfollowUser: unfollowMutation.mutate,
    isFollowingLoading: followMutation.isPending || unfollowMutation.isPending,
  };
};
