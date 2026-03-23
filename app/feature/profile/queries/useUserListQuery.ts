"use client";

import { useQuery } from "@tanstack/react-query";
import type { UserListType } from "../types/user-list.types";
import { fetchFollowers, fetchFollowing, fetchFriends } from "../api/userListApi";
import { profileQueryKeys } from "./profile.query-keys";

export function useUserListQuery(
  isOpen: boolean,
  listType: UserListType | null,
  userId: string,
) {
  const queryKey = profileQueryKeys.userList(userId, listType);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!listType || !userId) {
        return [];
      }

      if (listType === "followers") {
        const res = await fetchFollowers(userId);
        return res.ok ? res.data : [];
      }

      if (listType === "following") {
        const res = await fetchFollowing(userId);
        return res.ok ? res.data : [];
      }

      const res = await fetchFriends(userId);
      return res.ok ? res.data : [];
    },
    enabled: isOpen && Boolean(listType) && Boolean(userId),
  });

  return {
    queryKey,
    users: query.data ?? [],
    isLoading: query.isLoading,
  };
}
