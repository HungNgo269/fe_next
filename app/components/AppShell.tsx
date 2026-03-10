"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import LeftSidebar from "./layout/LeftSidebar";
import { clientGetJson, refreshTokens } from "../share/utils/api";
import type {
  SidebarMessagePreview,
  SidebarNotificationItem,
} from "../feature/feed/types/feed";
import {
  DEFAULT_NOTIFICATION_LIMIT,
  NOTIFICATION_BADGE_EVENT,
  NOTIFICATION_SOCKET_NAMESPACE,
} from "../share/constants/notification.constants";
import {
  fetchNotificationSummary,
  fetchNotificationUnreadCount,
  markAllNotificationsAsRead,
} from "../share/api/notificationApi";
import {
  toAvatarFromProfile,
  useAppSessionStore,
} from "../share/stores/appSessionStore";
import { formatRelativeTime } from "../share/utils/format";
import { fetchCurrentUser } from "../share/api/userApi";

const AUTH_ROUTES = new Set(["/login", "/register"]);
const NOTIFICATION_SUMMARY_TTL_MS = 15_000;

type Conversation = {
  id: string;
  isGroup: boolean;
  name?: string | null;
  participants?: Array<{ userId: string }>;
  messages?: Array<{ content?: string | null; createdAt?: string }>;
  updatedAt?: string;
};

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const storedAuthProfile = useAppSessionStore((state) => state.authProfile);
  const storedIsAuthenticated = useAppSessionStore(
    (state) => state.isAuthenticated,
  );
  const setAuthenticatedProfile = useAppSessionStore(
    (state) => state.setAuthenticatedProfile,
  );
  const clearAuthenticatedProfile = useAppSessionStore(
    (state) => state.clearAuthenticatedProfile,
  );
  const [messages, setMessages] = useState<SidebarMessagePreview[]>([]);
  const [notifications, setNotifications] = useState<SidebarNotificationItem[]>(
    [],
  );
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [socketUserId, setSocketUserId] = useState<string | null>(null);
  const summaryInFlightRef = useRef<Promise<SidebarNotificationItem[]> | null>(null);
  const summaryFetchedAtRef = useRef(0);
  const markAllReadInFlightRef = useRef<Promise<boolean> | null>(null);
  const isAuthenticated = storedIsAuthenticated;
  const currentUser = toAvatarFromProfile(storedAuthProfile);

  const isAuthRoute = AUTH_ROUTES.has(pathname);

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
      const request = fetchNotificationSummary(DEFAULT_NOTIFICATION_LIMIT)
        .then((summary) => {
          summaryFetchedAtRef.current = Date.now();
          startTransition(() => {
            setNotifications(summary);
          });
          return summary;
        })
        .finally(() => {
          summaryInFlightRef.current = null;
          setNotificationLoading(false);
        });

      summaryInFlightRef.current = request;
      return request;
    },
    [notifications],
  );

  const markNotificationsAsRead = useCallback(async () => {
    if (markAllReadInFlightRef.current) {
      return markAllReadInFlightRef.current;
    }

    const request = markAllNotificationsAsRead().finally(() => {
      markAllReadInFlightRef.current = null;
    });
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
    if (isAuthRoute) {
      return;
    }

    let active = true;

    const bootstrap = async () => {
      setSocketReady(false);
      setSocketUserId(null);

      const userResult = await fetchCurrentUser();
      if (!active) return;

      if (!userResult.ok) {
        clearAuthenticatedProfile();
        setMessages([]);
        setNotifications([]);
        setNotificationCount(0);
        summaryFetchedAtRef.current = 0;
        return;
      }

      if (userResult.data.currentUserProfile) {
        setAuthenticatedProfile(userResult.data.currentUserProfile);
      } else {
        clearAuthenticatedProfile();
        setMessages([]);
        setNotifications([]);
        setNotificationCount(0);
        summaryFetchedAtRef.current = 0;
      }

      if (
        !userResult.data.isAuthenticated ||
        !userResult.data.currentUser
      ) {
        return;
      }

      const [convResult, unreadCount, summary] = await Promise.all([
        clientGetJson<Conversation[]>("/conversations?limit=8"),
        fetchNotificationUnreadCount(),
        fetchNotificationSummary(DEFAULT_NOTIFICATION_LIMIT),
      ]);
      if (!active) return;

      setNotificationCount(unreadCount);
      setNotifications(summary);
      summaryFetchedAtRef.current = Date.now();
      setSocketUserId(userResult.data.currentUser.id);
      setSocketReady(true);

      if (!convResult.ok) return;

      const currentUserId = userResult.data.currentUser.id;
      setMessages(
        convResult.data.map((conv) => {
          const latest = conv.messages?.[0];
          const otherId = conv.participants?.find(
            (p) => p.userId !== currentUserId,
          )?.userId;
          const fallbackName = conv.isGroup ? "Group chat" : "Direct message";
          return {
            id: conv.id,
            name: conv.name || (otherId ?? fallbackName),
            preview: latest?.content?.trim() || "No messages yet",
            time: formatRelativeTime(latest?.createdAt ?? conv.updatedAt),
          };
        }),
      );
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [clearAuthenticatedProfile, isAuthRoute, setAuthenticatedProfile]);

  useEffect(() => {
    if (!socketReady || !socketUserId) {
      return;
    }

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";
    const socketBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");
    let refreshing = false;

    const socket: Socket = io(
      `${socketBaseUrl}${NOTIFICATION_SOCKET_NAMESPACE}`,
      {
        withCredentials: true,
        transports: ["websocket", "polling"],
      },
    );

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
      if (!message.toLowerCase().includes("jwt expired") || refreshing) {
        return;
      }
      refreshing = true;
      void refreshTokens()
        .then(() => {
          socket.connect();
        })
        .finally(() => {
          refreshing = false;
        });
    };

    socket.on(NOTIFICATION_BADGE_EVENT, onBadge);
    socket.on("connect_error", onConnectError);
    return () => {
      socket.off(NOTIFICATION_BADGE_EVENT, onBadge);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [socketReady, socketUserId]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <LeftSidebar
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onRequireAuth={() => router.push("/login")}
        messages={messages}
        notifications={notifications}
        notificationCount={notificationCount}
        notificationLoading={notificationLoading}
        onNotificationSelect={openNotificationPanel}
      />
      <div className="lg:pl-20">{children}</div>
    </div>
  );
}
