"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import LeftSidebar from "../feature/post/components/LeftSidebar";
import { fetchFeedBootstrap } from "../feature/post/api/feedApi";
import type {
  SidebarMessagePreview,
  SidebarNotificationItem,
} from "../feature/post/types/feed";
import {
  GUEST_AVATAR,
  toAvatarFromProfile,
  useAppSessionStore,
} from "../share/stores/appSessionStore";

const AUTH_ROUTES = new Set(["/login", "/register"]);

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
  const isAuthenticated = storedIsAuthenticated;
  const currentUser = storedAuthProfile
    ? toAvatarFromProfile(storedAuthProfile)
    : GUEST_AVATAR;

  const isAuthRoute = AUTH_ROUTES.has(pathname);

  useEffect(() => {
    if (isAuthRoute) {
      return;
    }

    let active = true;

    const bootstrap = async () => {
      const result = await fetchFeedBootstrap();
      if (!active || !result.ok) {
        return;
      }

      if (result.data.currentUserProfile) {
        setAuthenticatedProfile(result.data.currentUserProfile);
      } else {
        clearAuthenticatedProfile();
      }
      setMessages(result.data.sidebarMessages);
      setNotifications(result.data.sidebarNotifications);
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
