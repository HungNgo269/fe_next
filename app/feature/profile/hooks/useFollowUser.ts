"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUserApi, unfollowUserApi } from "../api/profileApi";
import type { ProfileFeedResponse } from "../types/api.types";

export const useFollowUser = (userId: string, profileKey: string) => {
  const queryClient = useQueryClient();

  const handleOptimisticUpdate = (isFollowing: boolean) => {
    queryClient.setQueryData(
      ["profile-feed", "other", profileKey],
      (old: ProfileFeedResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          user: {
            ...old.user,
            isFollowing,
            followersCount: Math.max(0, old.user.followersCount + (isFollowing ? 1 : -1)),
          },
        };
      }
    );
  };

  const followMutation = useMutation({
    mutationFn: () => followUserApi(userId),
    onMutate: () => {
      handleOptimisticUpdate(true);
    },
    onError: () => {
      handleOptimisticUpdate(false);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile-feed"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUserApi(userId),
    onMutate: () => {
      handleOptimisticUpdate(false);
    },
    onError: () => {
      handleOptimisticUpdate(true);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile-feed"] });
    },
  });

  return {
    followUser: followMutation.mutate,
    unfollowUser: unfollowMutation.mutate,
    isFollowingLoading: followMutation.isPending || unfollowMutation.isPending,
  };
};
