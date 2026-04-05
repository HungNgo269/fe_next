"use client";

import { useCallback, useMemo, useState } from "react";
import { useLogout } from "@/app/share/hooks/useLogout";
import type { UserListType } from "../types/user-list.types";
import { useProfileFeedQuery } from "../queries/useProfileFeedQuery";
import { useFriendRequestsQuery } from "../queries/useFriendRequestsQuery";

export type UseProfilePageControllerOptions = {
  profileKey: string;
  viewerId?: string | null;
  initialAccessState?: import("@/app/share/utils/access-state").AccessState;
};

export function useProfilePageController({
  profileKey,
  viewerId,
  initialAccessState,
}: UseProfilePageControllerOptions) {
  const logoutUser = useLogout();
  const feed = useProfileFeedQuery({
    profileKey,
    viewerId,
    initialAccessState,
  });
  const { requests } = useFriendRequestsQuery(feed.canEditProfile);

  const [listModalType, setListModalType] = useState<UserListType | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [friendRequestsModalOpen, setFriendRequestsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const incomingCount = useMemo(
    () => requests.filter((request) => request.direction === "incoming").length,
    [requests],
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
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, logoutUser]);

  return {
    feed,
    ui: {
      listModalType,
      listModalOpen,
      friendRequestsModalOpen,
      incomingCount,
      isLoggingOut,
      openListModal,
      closeListModal,
      openFriendRequestsModal,
      closeFriendRequestsModal,
      handleLogout,
    },
  };
}
