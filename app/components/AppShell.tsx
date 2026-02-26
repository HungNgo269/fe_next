"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import LeftSidebar from "./layout/LeftSidebar";
import { fetchCurrentUser } from "../feature/post/api/feedApi";
import { clientGetJson } from "../share/utils/api";
import type {
  SidebarMessagePreview,
  SidebarNotificationItem,
} from "../feature/post/types/feed";
import {
  toAvatarFromProfile,
  useAppSessionStore,
} from "../share/stores/appSessionStore";
import { formatRelativeTime } from "../share/utils/format";

const AUTH_ROUTES = new Set(["/login", "/register"]);

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
  const [notifications] = useState<SidebarNotificationItem[]>([]);
  const isAuthenticated = storedIsAuthenticated;
  const currentUser = toAvatarFromProfile(storedAuthProfile);

  const isAuthRoute = AUTH_ROUTES.has(pathname);

  useEffect(() => {
    if (isAuthRoute) {
      return;
    }

    let active = true;

    const bootstrap = async () => {
      const userResult = await fetchCurrentUser();
      if (!active) return;

      if (userResult.ok) {
        if (userResult.data.currentUserProfile) {
          setAuthenticatedProfile(userResult.data.currentUserProfile);
        } else {
          clearAuthenticatedProfile();
        }
      }

      if (userResult.ok && userResult.data.isAuthenticated && userResult.data.currentUser) {
        const convResult = await clientGetJson<Conversation[]>("/conversations?limit=8");
        if (!active || !convResult.ok) return;

        const currentUserId = userResult.data.currentUser.id;
        setMessages(
          convResult.data.map((conv) => {
            const latest = conv.messages?.[0];
            const otherId = conv.participants?.find((p) => p.userId !== currentUserId)?.userId;
            const fallbackName = conv.isGroup ? "Group chat" : "Direct message";
            return {
              id: conv.id,
              name: conv.name || (otherId ?? fallbackName),
              preview: latest?.content?.trim() || "No messages yet",
              time: formatRelativeTime(latest?.createdAt ?? conv.updatedAt),
            };
          }),
        );
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [
    clearAuthenticatedProfile,
    isAuthRoute,
    setAuthenticatedProfile,
  ]);

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
      />
      <div className="lg:pl-20">{children}</div>
    </div>
  );
}
