import type { SidebarNotificationItem } from "@/app/feature/feed/types/feed";
import {
  DEFAULT_NOTIFICATION_LIMIT,
  MAX_NOTIFICATION_LIMIT,
} from "@/app/share/constants/notification.constants";
import { clientGetJson, clientPostJson } from "@/app/share/utils/api";
import { formatRelativeTime } from "@/app/share/utils/format";

type NotificationSummaryResponse = {
  id: string;
  type:
    | "LIKE"
    | "COMMENT"
    | "FRIEND_REQUEST"
    | "FRIEND_ACCEPTED"
    | "NEW_FOLLOWER"
    | "NEW_MESSAGE";
  title: string;
  createdAt: string;
  unreadEvents: number;
  uniqueActors: number;
  referenceId: string | null;
};

type UnreadCountResponse = {
  unreadCount: number;
};

export const fetchNotificationSummary = async (
  limit = DEFAULT_NOTIFICATION_LIMIT,
): Promise<SidebarNotificationItem[]> => {
  const response = await clientGetJson<NotificationSummaryResponse[]>(
    `/notifications/summary?limit=${Math.max(1, Math.min(limit, MAX_NOTIFICATION_LIMIT))}`,
  );
  if (!response.ok) {
    return [];
  }

  return response.data.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    unreadEvents: item.unreadEvents,
    uniqueActors: item.uniqueActors,
    referenceId: item.referenceId,
    time: formatRelativeTime(item.createdAt),
  }));
};

export const fetchNotificationUnreadCount = async (): Promise<number> => {
  const response = await clientGetJson<UnreadCountResponse>(
    "/notifications/unread-count",
  );
  if (!response.ok) {
    return 0;
  }
  return response.data.unreadCount ?? 0;
};

export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  const response = await clientPostJson<{ success: boolean }>(
    "/notifications/mark-all-read",
    {},
  );
  return response.ok;
};
