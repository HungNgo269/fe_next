"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendFriendRequestApi,
  cancelFriendRequestApi,
  acceptFriendRequestApi,
  declineFriendRequestApi,
  removeFriendApi,
} from "../api/profileApi";
import type { ProfileFeedResponse } from "../types/api.types";
import type { FriendshipStatus } from "../types/api.types";

const updateFriendshipStatus = (
  queryClient: ReturnType<typeof useQueryClient>,
  profileKey: string,
  status: FriendshipStatus,
  friendsDelta = 0,
) => {
  queryClient.setQueryData(
    ["profile-feed", "other", profileKey],
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

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["profile-feed"] });
    void queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
  };

  const sendRequest = useMutation({
    mutationFn: () => sendFriendRequestApi(userId),
    onMutate: () => updateFriendshipStatus(queryClient, profileKey, "PENDING_SENT"),
    onError: () => updateFriendshipStatus(queryClient, profileKey, "NONE"),
    onSettled: invalidate,
  });

  const cancelRequest = useMutation({
    mutationFn: () => cancelFriendRequestApi(userId),
    onMutate: () => updateFriendshipStatus(queryClient, profileKey, "NONE"),
    onError: () => updateFriendshipStatus(queryClient, profileKey, "PENDING_SENT"),
    onSettled: invalidate,
  });

  const acceptRequest = useMutation({
    mutationFn: () => acceptFriendRequestApi(userId),
    onMutate: () => updateFriendshipStatus(queryClient, profileKey, "ACCEPTED", +1),
    onError: () => updateFriendshipStatus(queryClient, profileKey, "PENDING_RECEIVED", -1),
    onSettled: invalidate,
  });

  const declineRequest = useMutation({
    mutationFn: () => declineFriendRequestApi(userId),
    onMutate: () => updateFriendshipStatus(queryClient, profileKey, "NONE"),
    onError: () => updateFriendshipStatus(queryClient, profileKey, "PENDING_RECEIVED"),
    onSettled: invalidate,
  });

  const removeFriend = useMutation({
    mutationFn: () => removeFriendApi(userId),
    onMutate: () => updateFriendshipStatus(queryClient, profileKey, "NONE", -1),
    onError: () => updateFriendshipStatus(queryClient, profileKey, "ACCEPTED", +1),
    onSettled: invalidate,
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
