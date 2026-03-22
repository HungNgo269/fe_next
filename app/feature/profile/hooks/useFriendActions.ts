"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  sendFriendRequestApi,
  cancelFriendRequestApi,
  acceptFriendRequestApi,
  declineFriendRequestApi,
  removeFriendApi,
} from "../api/profileApi";
import type { ProfileFeedResponse } from "../types/api.types";
import type { FriendshipStatus } from "../types/api.types";
import { useSafeOptimisticMutation } from "@/app/share/hooks/useSafeOptimisticMutation";
import { profileQueryKeys } from "../queries/profile.query-keys";

const updateFriendshipStatus = (
  queryClient: ReturnType<typeof useQueryClient>,
  profileKey: string,
  status: FriendshipStatus,
  friendsDelta = 0,
) => {
  queryClient.setQueryData(
    profileQueryKeys.other(profileKey),
    (old: ProfileFeedResponse | undefined) => {
      if (!old) return old;
      return {
        ...old,
        user: {
          ...old.user,
          friendshipStatus: status,
          friendsCount: Math.max(0, old.user.friendsCount + friendsDelta),
        },
      };
    },
  );
};

export const useFriendActions = (userId: string, profileKey: string) => {
  const queryClient = useQueryClient();
  const profileQueryKey = profileQueryKeys.other(profileKey);

  const invalidateFriendRequests = () => {
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.friendRequests() });
  };

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
      updateFriendshipStatus(queryClient, profileKey, "PENDING_SENT");
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
      updateFriendshipStatus(queryClient, profileKey, "NONE");
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
      updateFriendshipStatus(queryClient, profileKey, "ACCEPTED", +1);
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
      updateFriendshipStatus(queryClient, profileKey, "NONE");
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
      updateFriendshipStatus(queryClient, profileKey, "NONE", -1);
    },
    rollback: (snapshot) => {
      queryClient.setQueryData(profileQueryKey, snapshot);
    },
    onSettled: invalidateFriendRequests,
    refetchType: "inactive",
    errorMessage: "Unable to remove friend.",
  });

  const isLoading =
    sendRequest.isPending ||
    cancelRequest.isPending ||
    acceptRequest.isPending ||
    declineRequest.isPending ||
    removeFriend.isPending;

  return {
    sendRequest: sendRequest.mutate,
    cancelRequest: cancelRequest.mutate,
    acceptRequest: acceptRequest.mutate,
    declineRequest: declineRequest.mutate,
    removeFriend: removeFriend.mutate,
    isFriendActionLoading: isLoading,
  };
};



