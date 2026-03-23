"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFriendRequests } from "../api/userListApi";
import { profileQueryKeys } from "./profile.query-keys";

export function useFriendRequestsQuery(enabled: boolean) {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: profileQueryKeys.friendRequests(),
    queryFn: async () => {
      const res = await fetchFriendRequests();
      return res.ok ? res.data : [];
    },
    enabled,
  });

  return {
    requests,
    isLoading,
  };
}
