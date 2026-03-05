"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFriendRequests } from "../api/userListApi";
import {
  acceptFriendRequestApi,
  cancelFriendRequestApi,
  declineFriendRequestApi,
} from "../api/profileApi";

const QUERY_KEY = ["friend-requests"] as const;
const INVALIDATE_KEYS = [["friend-requests"], ["profile-feed"]] as const;

export function useFriendRequestActions(enabled: boolean) {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await fetchFriendRequests();
      return res.ok ? res.data : [];
    },
    enabled,
  });

  const invalidateAll = () => {
    for (const key of INVALIDATE_KEYS) {
      void queryClient.invalidateQueries({ queryKey: key });
    }
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
    requests,
    isLoading,
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
