"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  acceptFriendRequestApi,
  cancelFriendRequestApi,
  declineFriendRequestApi,
  followUserApi,
  removeFriendApi,
  sendFriendRequestApi,
  unfollowUserApi,
} from "../api/profileApi";
import type { ProfileFeedResponse, FriendshipStatus } from "../types/api.types";
import { useSafeOptimisticMutation } from "@/app/share/hooks/useSafeOptimisticMutation";
import { profileQueryKeys } from "../queries/profile.query-keys";

const updateProfileConnection = (
  queryClient: ReturnType<typeof useQueryClient>,
  profileKey: string,
  input: {
    isFollowing?: boolean;
    followersDelta?: number;
    friendshipStatus?: FriendshipStatus;
    friendsDelta?: number;
  },
) => {
  queryClient.setQueryData(
    profileQueryKeys.other(profileKey),
    (old: ProfileFeedResponse | undefined) => {
      if (!old) {
        return old;
      }

      return {
        ...old,
        user: {
          ...old.user,
          isFollowing: input.isFollowing ?? old.user.isFollowing,
          followersCount: Math.max(
            0,
            old.user.followersCount + (input.followersDelta ?? 0),
          ),
          friendshipStatus: input.friendshipStatus ?? old.user.friendshipStatus,
          friendsCount: Math.max(
            0,
            old.user.friendsCount + (input.friendsDelta ?? 0),
          ),
        },
      };
    },
  );
};

export function useProfileConnectionMutations(userId: string, profileKey: string) {
  const queryClient = useQueryClient();
  const profileQueryKey = profileQueryKeys.other(profileKey);

  const invalidateFriendRequests = () => {
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.friendRequests() });
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
      updateProfileConnection(queryClient, profileKey, {
        isFollowing: true,
        followersDelta: 1,
      });
    },
    rollback: (snapshot) => {
      queryClient.setQueryData(profileQueryKey, snapshot);
    },
    refetchType: "inactive",
    errorMessage: "Unable to follow user.",
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
      updateProfileConnection(queryClient, profileKey, {
        isFollowing: false,
        followersDelta: -1,
      });
    },
    rollback: (snapshot) => {
      queryClient.setQueryData(profileQueryKey, snapshot);
    },
    refetchType: "inactive",
    errorMessage: "Unable to unfollow user.",
  });

  const sendRequest = useSafeOptimisticMutation<void, void, ProfileFeedResponse | undefined>({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await sendFriendRequestApi(userId);
      if (!result.ok && result.error.status !== 409) {
        throw new Error(result.error.messages[0] ?? "Unable to send friend request.");
      }
    },
    getSnapshot: () => queryClient.getQueryData<ProfileFeedResponse>(profileQueryKey),
    applyOptimistic: () => {
      updateProfileConnection(queryClient, profileKey, {
        friendshipStatus: "PENDING_SENT",
      });
    },
    rollback: (snapshot) => {
      queryClient.setQueryData(profileQueryKey, snapshot);
    },
    onSettled: invalidateFriendRequests,
    refetchType: "inactive",
    errorMessage: "Unable to send friend request.",
  });

  const cancelRequest = useSafeOptimisticMutation<void, void, ProfileFeedResponse | undefined>({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await cancelFriendRequestApi(userId);
      if (!result.ok && result.error.status !== 404) {
        throw new Error(result.error.messages[0] ?? "Unable to cancel friend request.");
      }
    },
    getSnapshot: () => queryClient.getQueryData<ProfileFeedResponse>(profileQueryKey),
    applyOptimistic: () => {
      updateProfileConnection(queryClient, profileKey, {
        friendshipStatus: "NONE",
      });
    },
    rollback: (snapshot) => {
      queryClient.setQueryData(profileQueryKey, snapshot);
    },
    onSettled: invalidateFriendRequests,
    refetchType: "inactive",
    errorMessage: "Unable to cancel friend request.",
  });

  const acceptRequest = useSafeOptimisticMutation<void, void, ProfileFeedResponse | undefined>({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await acceptFriendRequestApi(userId);
      if (!result.ok && result.error.status !== 404 && result.error.status !== 409) {
        throw new Error(result.error.messages[0] ?? "Unable to accept friend request.");
      }
    },
    getSnapshot: () => queryClient.getQueryData<ProfileFeedResponse>(profileQueryKey),
    applyOptimistic: () => {
      updateProfileConnection(queryClient, profileKey, {
        friendshipStatus: "ACCEPTED",
        friendsDelta: 1,
      });
    },
    rollback: (snapshot) => {
      queryClient.setQueryData(profileQueryKey, snapshot);
    },
    onSettled: invalidateFriendRequests,
    refetchType: "inactive",
    errorMessage: "Unable to accept friend request.",
  });

  const declineRequest = useSafeOptimisticMutation<void, void, ProfileFeedResponse | undefined>({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await declineFriendRequestApi(userId);
      if (!result.ok && result.error.status !== 404 && result.error.status !== 409) {
        throw new Error(result.error.messages[0] ?? "Unable to decline friend request.");
      }
    },
    getSnapshot: () => queryClient.getQueryData<ProfileFeedResponse>(profileQueryKey),
    applyOptimistic: () => {
      updateProfileConnection(queryClient, profileKey, {
        friendshipStatus: "NONE",
      });
    },
    rollback: (snapshot) => {
      queryClient.setQueryData(profileQueryKey, snapshot);
    },
    onSettled: invalidateFriendRequests,
    refetchType: "inactive",
    errorMessage: "Unable to decline friend request.",
  });

  const removeFriend = useSafeOptimisticMutation<void, void, ProfileFeedResponse | undefined>({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await removeFriendApi(userId);
      if (!result.ok && result.error.status !== 404) {
        throw new Error(result.error.messages[0] ?? "Unable to remove friend.");
      }
    },
    getSnapshot: () => queryClient.getQueryData<ProfileFeedResponse>(profileQueryKey),
    applyOptimistic: () => {
      updateProfileConnection(queryClient, profileKey, {
        friendshipStatus: "NONE",
        friendsDelta: -1,
      });
    },
    rollback: (snapshot) => {
      queryClient.setQueryData(profileQueryKey, snapshot);
    },
    onSettled: invalidateFriendRequests,
    refetchType: "inactive",
    errorMessage: "Unable to remove friend.",
  });

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    sendFriendRequest: sendRequest.mutate,
    cancelFriendRequest: cancelRequest.mutate,
    acceptFriendRequest: acceptRequest.mutate,
    declineFriendRequest: declineRequest.mutate,
    removeFriend: removeFriend.mutate,
    isFollowingLoading: followMutation.isPending || unfollowMutation.isPending,
    isFriendActionLoading:
      sendRequest.isPending ||
      cancelRequest.isPending ||
      acceptRequest.isPending ||
      declineRequest.isPending ||
      removeFriend.isPending,
  };
}
