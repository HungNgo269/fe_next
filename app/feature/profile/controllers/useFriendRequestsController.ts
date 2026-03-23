"use client";

import { useMemo } from "react";
import type { FriendRequestUser } from "../types/user-list.types";
import { useFriendRequestsQuery } from "../queries/useFriendRequestsQuery";
import { useFriendRequestMutations } from "../mutations/useFriendRequestMutations";

export function useFriendRequestsController(enabled: boolean) {
  const { requests, isLoading } = useFriendRequestsQuery(enabled);
  const mutations = useFriendRequestMutations();

  const incomingRequests = useMemo(
    () =>
      requests.filter(
        (item): item is FriendRequestUser => item.direction === "incoming",
      ),
    [requests],
  );

  return {
    requests,
    incomingRequests,
    isLoading,
    ...mutations,
  };
}
