"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { SidebarNotificationItem } from "@/app/feature/feed/types/feed";
import type { FriendRequestUser } from "@/app/feature/profile/types/user-list.types";
import { useFriendRequestActions } from "@/app/feature/profile/hooks/useFriendRequestActions";
import NotificationPanelHeader from "./notification-panel/NotificationPanelHeader";
import NotificationFriendSection from "./notification-panel/NotificationFriendSection";
import NotificationPostSection from "./notification-panel/NotificationPostSection";

type NotificationPanelProps = {
  notifications: SidebarNotificationItem[];
  loading: boolean;
  onBack?: () => void;
};

const POST_PAGE_SIZE = 10;
const FRIEND_TYPES = new Set<SidebarNotificationItem["type"]>([
  "FRIEND_REQUEST",
  "FRIEND_ACCEPTED",
  "NEW_FOLLOWER",
]);

export default function NotificationPanel({
  notifications,
  loading,
  onBack,
}: NotificationPanelProps) {
  const [visiblePostCount, setVisiblePostCount] = useState(POST_PAGE_SIZE);
  const {
    requests,
    isLoading: friendRequestLoading,
    accept,
    decline,
    isAccepting,
    isDeclining,
  } = useFriendRequestActions(true);

  const incomingRequests = useMemo(
    () =>
      requests.filter(
        (item): item is FriendRequestUser => item.direction === "incoming",
      ),
    [requests],
  );

  const friendNotifications = useMemo(
    () => notifications.filter((item) => FRIEND_TYPES.has(item.type)),
    [notifications],
  );

  const friendActivityNotifications = useMemo(
    () => friendNotifications.filter((item) => item.type !== "FRIEND_REQUEST"),
    [friendNotifications],
  );

  const postNotifications = useMemo(
    () =>
      notifications.filter(
        (item) => item.type === "LIKE" || item.type === "COMMENT",
      ),
    [notifications],
  );

  const visiblePostNotifications = postNotifications.slice(0, visiblePostCount);

  if (loading) {
    return (
      <div className="h-full w-full bg-background">
        <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background">
      <NotificationPanelHeader onBack={onBack} />

      <div className="h-[calc(100vh-57px)] space-y-3 overflow-y-auto px-2.5 py-2.5 sm:space-y-5 sm:px-3 sm:py-3">
        <NotificationFriendSection
          friendRequestLoading={friendRequestLoading}
          incomingRequests={incomingRequests}
          friendActivityNotifications={friendActivityNotifications}
          onAccept={accept}
          onDecline={decline}
          isAccepting={isAccepting}
          isDeclining={isDeclining}
        />

        <NotificationPostSection
          visiblePostCount={visiblePostCount}
          postNotifications={postNotifications}
          visiblePostNotifications={visiblePostNotifications}
          onLoadMore={() =>
            setVisiblePostCount((prev) =>
              Math.min(prev + POST_PAGE_SIZE, postNotifications.length),
            )
          }
        />
      </div>
    </div>
  );
}
