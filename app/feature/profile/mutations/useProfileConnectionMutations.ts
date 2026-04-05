"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  acceptFriendRequestAction,
  cancelFriendRequestAction,
  declineFriendRequestAction,
  followUserAction,
  removeFriendAction,
  sendFriendRequestAction,
  unfollowUserAction,
} from "../actions/profile.actions";
import type { ProfileFeedResponse, FriendshipStatus } from "../types/api.types";
import { useSafeOptimisticMutation } from "@/app/share/hooks/useSafeOptimisticMutation";
import { profileQueryKeys } from "../queries/profile.query-keys";
import { useRequireAuthAction } from "@/app/feature/post/hooks/useRequireAuthAction";
import {
  getApiResultMessage,
  getApiResultStatus,
  isForbiddenStatus,
  isUnauthenticatedStatus,
} from "@/app/share/utils/api-result";

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
    profileQueryKeys.detail(profileKey),
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
  const { runIfAuth } = useRequireAuthAction();
  const profileQueryKey = profileQueryKeys.detail(profileKey);

  const invalidateFriendRequests = () => {
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.friendRequests() });
  };

  const followMutation = useSafeOptimisticMutation<
    void,
    void,
    ProfileFeedResponse | undefined
  >({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await followUserAction(userId);
      if (!result.ok && result.error.status !== 409) {
        const status = getApiResultStatus(result);
        if (isForbiddenStatus(status)) {
          throw new Error("You do not have permission to follow this user.");
        }
        if (isUnauthenticatedStatus(status)) {
          throw new Error("Your session has expired. Please sign in again.");
        }
        throw new Error(getApiResultMessage(result, "Unable to follow user."));
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

  const unfollowMutation = useSafeOptimisticMutation<
    void,
    void,
    ProfileFeedResponse | undefined
  >({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await unfollowUserAction(userId);
      if (!result.ok && result.error.status !== 404) {
        const status = getApiResultStatus(result);
        if (isForbiddenStatus(status)) {
          throw new Error("You do not have permission to unfollow this user.");
        }
        if (isUnauthenticatedStatus(status)) {
          throw new Error("Your session has expired. Please sign in again.");
        }
        throw new Error(getApiResultMessage(result, "Unable to unfollow user."));
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

  const sendRequest = useSafeOptimisticMutation<
    void,
    void,
    ProfileFeedResponse | undefined
  >({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await sendFriendRequestAction(userId);
      if (!result.ok && result.error.status !== 409) {
        const status = getApiResultStatus(result);
        if (isForbiddenStatus(status)) {
          throw new Error("You do not have permission to send a friend request.");
        }
        if (isUnauthenticatedStatus(status)) {
          throw new Error("Your session has expired. Please sign in again.");
        }
        throw new Error(getApiResultMessage(result, "Unable to send friend request."));
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

  const cancelRequest = useSafeOptimisticMutation<
    void,
    void,
    ProfileFeedResponse | undefined
  >({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await cancelFriendRequestAction(userId);
      if (!result.ok && result.error.status !== 404) {
        const status = getApiResultStatus(result);
        if (isForbiddenStatus(status)) {
          throw new Error("You do not have permission to cancel this friend request.");
        }
        if (isUnauthenticatedStatus(status)) {
          throw new Error("Your session has expired. Please sign in again.");
        }
        throw new Error(getApiResultMessage(result, "Unable to cancel friend request."));
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

  const acceptRequest = useSafeOptimisticMutation<
    void,
    void,
    ProfileFeedResponse | undefined
  >({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await acceptFriendRequestAction(userId);
      if (!result.ok && result.error.status !== 404 && result.error.status !== 409) {
        const status = getApiResultStatus(result);
        if (isForbiddenStatus(status)) {
          throw new Error("You do not have permission to accept this friend request.");
        }
        if (isUnauthenticatedStatus(status)) {
          throw new Error("Your session has expired. Please sign in again.");
        }
        throw new Error(getApiResultMessage(result, "Unable to accept friend request."));
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

  const declineRequest = useSafeOptimisticMutation<
    void,
    void,
    ProfileFeedResponse | undefined
  >({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await declineFriendRequestAction(userId);
      if (!result.ok && result.error.status !== 404 && result.error.status !== 409) {
        const status = getApiResultStatus(result);
        if (isForbiddenStatus(status)) {
          throw new Error("You do not have permission to decline this friend request.");
        }
        if (isUnauthenticatedStatus(status)) {
          throw new Error("Your session has expired. Please sign in again.");
        }
        throw new Error(getApiResultMessage(result, "Unable to decline friend request."));
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

  const removeFriend = useSafeOptimisticMutation<
    void,
    void,
    ProfileFeedResponse | undefined
  >({
    queryKey: profileQueryKey,
    mutationFn: async () => {
      const result = await removeFriendAction(userId);
      if (!result.ok && result.error.status !== 404) {
        const status = getApiResultStatus(result);
        if (isForbiddenStatus(status)) {
          throw new Error("You do not have permission to remove this friend.");
        }
        if (isUnauthenticatedStatus(status)) {
          throw new Error("Your session has expired. Please sign in again.");
        }
        throw new Error(getApiResultMessage(result, "Unable to remove friend."));
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

  const requireAuthMutation = useCallback(
    (action: () => void) => {
      runIfAuth(action);
    },
    [runIfAuth],
  );

  return {
    follow: () => requireAuthMutation(() => followMutation.mutate()),
    unfollow: () => requireAuthMutation(() => unfollowMutation.mutate()),
    sendFriendRequest: () => requireAuthMutation(() => sendRequest.mutate()),
    cancelFriendRequest: () => requireAuthMutation(() => cancelRequest.mutate()),
    acceptFriendRequest: () => requireAuthMutation(() => acceptRequest.mutate()),
    declineFriendRequest: () => requireAuthMutation(() => declineRequest.mutate()),
    removeFriend: () => requireAuthMutation(() => removeFriend.mutate()),
    isFollowingLoading: followMutation.isPending || unfollowMutation.isPending,
    isFriendActionLoading:
      sendRequest.isPending ||
      cancelRequest.isPending ||
      acceptRequest.isPending ||
      declineRequest.isPending ||
      removeFriend.isPending,
  };
}
