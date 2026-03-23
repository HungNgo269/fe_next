"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptFriendRequestApi,
  cancelFriendRequestApi,
  declineFriendRequestApi,
} from "../api/profileApi";
import { profileQueryKeys } from "../queries/profile.query-keys";

export function useFriendRequestMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.friendRequests() });
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
  };

  const acceptMutation = useMutation({
    mutationFn: (userId: string) => acceptFriendRequestApi(userId),
    onSettled: invalidateAll,
  });

  const declineMutation = useMutation({
    mutationFn: (userId: string) => declineFriendRequestApi(userId),
    onSettled: invalidateAll,
  });

  const cancelMutation = useMutation({
    mutationFn: (userId: string) => cancelFriendRequestApi(userId),
    onSettled: invalidateAll,
  });

  return {
    accept: (userId: string) => acceptMutation.mutate(userId),
    decline: (userId: string) => declineMutation.mutate(userId),
    cancel: (userId: string) => cancelMutation.mutate(userId),
    isAccepting: (userId: string) =>
      acceptMutation.isPending && acceptMutation.variables === userId,
    isDeclining: (userId: string) =>
      declineMutation.isPending && declineMutation.variables === userId,
    isCancelling: (userId: string) =>
      cancelMutation.isPending && cancelMutation.variables === userId,
  };
}
