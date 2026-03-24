"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { SidebarNotificationItem } from "@/app/feature/feed/types/feed";
import {
  fetchNotificationSummary,
  fetchNotificationUnreadCount,
  markAllNotificationsAsRead,
} from "@/app/share/api/notificationApi";
import {
  DEFAULT_NOTIFICATION_LIMIT,
  NOTIFICATION_BADGE_EVENT,
  NOTIFICATION_SOCKET_NAMESPACE,
} from "@/app/share/constants/notification.constants";
import { refreshTokens } from "@/app/share/utils/api";

const NOTIFICATION_SUMMARY_TTL_MS = 15_000;

type UseAppShellNotificationsOptions = {
  authenticatedUserId: string | null;
};

export function useAppShellNotifications({
  authenticatedUserId,
}: UseAppShellNotificationsOptions) {
  const [notifications, setNotifications] = useState<SidebarNotificationItem[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const summaryInFlightRef = useRef<Promise<SidebarNotificationItem[]> | null>(
    null,
  );
  const summaryFetchedAtRef = useRef(0);
  const markAllReadInFlightRef = useRef<Promise<boolean> | null>(null);

  const resetNotificationState = useCallback(() => {
    setNotifications([]);
    setNotificationCount(0);
    summaryFetchedAtRef.current = 0;
  }, []);

  const loadNotificationSummary = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      const now = Date.now();
      const isFresh =
        !force &&
        notifications.length > 0 &&
        now - summaryFetchedAtRef.current < NOTIFICATION_SUMMARY_TTL_MS;

      if (isFresh) {
        return notifications;
      }
      if (summaryInFlightRef.current) {
        return summaryInFlightRef.current;
      }

      setNotificationLoading(true);
      const request = (async () => {
        try {
          const summary = await fetchNotificationSummary(
            DEFAULT_NOTIFICATION_LIMIT,
          );
          summaryFetchedAtRef.current = Date.now();
          startTransition(() => {
            setNotifications(summary);
          });
          return summary;
        } finally {
          summaryInFlightRef.current = null;
          setNotificationLoading(false);
        }
      })();

      summaryInFlightRef.current = request;
      return request;
    },
    [notifications],
  );

  const markNotificationsAsRead = useCallback(async () => {
    if (markAllReadInFlightRef.current) {
      return markAllReadInFlightRef.current;
    }

    const request = (async () => {
      try {
        return await markAllNotificationsAsRead();
      } finally {
        markAllReadInFlightRef.current = null;
      }
    })();

    markAllReadInFlightRef.current = request;
    return request;
  }, []);

  const openNotificationPanel = useCallback(async () => {
    await loadNotificationSummary();
    if (notificationCount <= 0) {
      return;
    }
    const marked = await markNotificationsAsRead();
    if (marked) {
      setNotificationCount(0);
    }
  }, [loadNotificationSummary, markNotificationsAsRead, notificationCount]);

  useEffect(() => {
    let active = true;

    if (!authenticatedUserId) {
      resetNotificationState();
      return () => {
        active = false;
      };
    }

    const bootstrap = async () => {
      const [unreadCount, summary] = await Promise.all([
        fetchNotificationUnreadCount(),
        fetchNotificationSummary(DEFAULT_NOTIFICATION_LIMIT),
      ]);
      if (!active) {
        return;
      }

      setNotificationCount(unreadCount);
      setNotifications(summary);
      summaryFetchedAtRef.current = Date.now();
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [authenticatedUserId, resetNotificationState]);

  useEffect(() => {
    if (!authenticatedUserId) {
      return;
    }

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";
    const socketBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");
    let refreshing = false;
    let cancelled = false;
    let socket: Socket | null = null;

    const onBadge = (payload: unknown) => {
      if (
        typeof payload === "object" &&
        payload !== null &&
        "unreadCount" in payload &&
        typeof payload.unreadCount === "number"
      ) {
        setNotificationCount(Math.max(0, payload.unreadCount));
      }
    };

    const onConnectError = (error: Error) => {
      const message = error?.message ?? "";
      if (
        !message.toLowerCase().includes("jwt expired") ||
        refreshing ||
        !socket
      ) {
        return;
      }

      refreshing = true;
      void (async () => {
        try {
          await refreshTokens();
          socket?.connect();
        } finally {
          refreshing = false;
        }
      })();
    };

    void (async () => {
      const { io } = await import("socket.io-client");
      if (cancelled) {
        return;
      }

      socket = io(`${socketBaseUrl}${NOTIFICATION_SOCKET_NAMESPACE}`, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      socket.on(NOTIFICATION_BADGE_EVENT, onBadge);
      socket.on("connect_error", onConnectError);
    })();

    return () => {
      cancelled = true;
      if (socket) {
        socket.off(NOTIFICATION_BADGE_EVENT, onBadge);
        socket.off("connect_error", onConnectError);
        socket.disconnect();
      }
    };
  }, [authenticatedUserId]);

  return {
    notifications,
    notificationCount,
    notificationLoading,
    openNotificationPanel,
  };
}
