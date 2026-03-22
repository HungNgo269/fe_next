"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFriendRequests } from "../api/userListApi";
import { useLogout } from "@/app/share/hooks/useLogout";
import { profileQueryKeys } from "../queries/profile.query-keys";
import type { UserListType } from "../types/user-list.types";

interface UseProfileViewOrchestrationOptions {
  canEditProfile: boolean;
}

export function useProfileViewOrchestration({
  canEditProfile,
}: UseProfileViewOrchestrationOptions) {
  const logoutUser = useLogout();

  const [listModalType, setListModalType] = useState<UserListType | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [friendRequestsModalOpen, setFriendRequestsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: pendingRequests = [] } = useQuery({
    queryKey: profileQueryKeys.friendRequests(),
    queryFn: async () => {
      const res = await fetchFriendRequests();
      return res.ok ? res.data : [];
    },
    enabled: canEditProfile,
  });

  const incomingCount = useMemo(
    () => pendingRequests.filter((r) => r.direction === "incoming").length,
    [pendingRequests],
  );

  const openListModal = useCallback((type: UserListType) => {
    setListModalType(type);
    setListModalOpen(true);
  }, []);

  const closeListModal = useCallback(() => {
    setListModalOpen(false);
  }, []);

  const openFriendRequestsModal = useCallback(() => {
    setFriendRequestsModalOpen(true);
  }, []);

  const closeFriendRequestsModal = useCallback(() => {
    setFriendRequestsModalOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, logoutUser]);

  return {
    listModalType,
    listModalOpen,
    openListModal,
    closeListModal,
    friendRequestsModalOpen,
    openFriendRequestsModal,
    closeFriendRequestsModal,
    incomingCount,
    isLoggingOut,
    handleLogout,
  };
}
