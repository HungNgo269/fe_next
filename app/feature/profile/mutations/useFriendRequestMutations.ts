"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptFriendRequestAction,
  cancelFriendRequestAction,
  declineFriendRequestAction,
} from "../actions/profile.actions";
import { profileQueryKeys } from "../queries/profile.query-keys";

export function useFriendRequestMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.friendRequests() });
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
  };

  const acceptMutation = useMutation({
    mutationFn: (userId: string) => acceptFriendRequestAction(userId),
    onSettled: invalidateAll,
  });

  const declineMutation = useMutation({
    mutationFn: (userId: string) => declineFriendRequestAction(userId),
    onSettled: invalidateAll,
  });

  const cancelMutation = useMutation({
    mutationFn: (userId: string) => cancelFriendRequestAction(userId),
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
