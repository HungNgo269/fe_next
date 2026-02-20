"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import LeftSidebar from "../feature/post/components/LeftSidebar";
import { fetchFeedBootstrap } from "../feature/post/api/feedApi";
import { currentUser as fallbackCurrentUser } from "../feature/post/data/feed";
import type {
  SidebarMessagePreview,
  SidebarNotificationItem,
} from "../feature/post/types/feed";

const AUTH_ROUTES = new Set(["/login", "/register"]);

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(fallbackCurrentUser);
  const [messages, setMessages] = useState<SidebarMessagePreview[]>([]);
  const [notifications, setNotifications] = useState<SidebarNotificationItem[]>(
    [],
  );

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

      setCurrentUser(result.data.currentUser);
      setIsAuthenticated(result.data.isAuthenticated);
      setMessages(result.data.sidebarMessages);
      setNotifications(result.data.sidebarNotifications);
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [isAuthRoute]);

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
