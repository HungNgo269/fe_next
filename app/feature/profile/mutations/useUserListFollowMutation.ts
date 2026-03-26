"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserListUser } from "../types/user-list.types";
import { followUserAction, unfollowUserAction } from "../actions/profile.actions";
import { profileQueryKeys } from "../queries/profile.query-keys";

export function useUserListFollowMutation(queryKey: readonly unknown[]) {
  const queryClient = useQueryClient();

  const optimisticUpdate = (targetUserId: string, isFollowing: boolean) => {
    queryClient.setQueryData(queryKey, (old: UserListUser[] | undefined) =>
      old?.map((u) => (u.id === targetUserId ? { ...u, isFollowing } : u)),
    );
  };

  const followMutation = useMutation({
    mutationFn: (targetUserId: string) => followUserAction(targetUserId),
    onMutate: (targetUserId) => optimisticUpdate(targetUserId, true),
    onError: (_, targetUserId) => optimisticUpdate(targetUserId, false),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueryKeys.userListAll() });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (targetUserId: string) => unfollowUserAction(targetUserId),
    onMutate: (targetUserId) => optimisticUpdate(targetUserId, false),
    onError: (_, targetUserId) => optimisticUpdate(targetUserId, true),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueryKeys.userListAll() });
    },
  });

  return {
    toggle: (user: UserListUser) => {
      if (user.isFollowing) {
        unfollowMutation.mutate(user.id);
        return;
      }

      followMutation.mutate(user.id);
    },
    isBusy: (targetUserId: string) =>
      (followMutation.isPending && followMutation.variables === targetUserId) ||
      (unfollowMutation.isPending && unfollowMutation.variables === targetUserId),
  };
}
