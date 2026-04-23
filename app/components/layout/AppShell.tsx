"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "./LeftSidebar";
import { useAppShellNotifications } from "../hooks/useAppShellNotifications";
import { useUser } from "@/app/share/providers/UserProvider";
import AppErrorBoundary from "@/app/share/components/AppErrorBoundary";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const currentUser = useUser();
  const {
    notifications,
    notificationCount,
    notificationLoading,
    openNotificationPanel,
  } = useAppShellNotifications({
    authenticatedUserId: currentUser?.id ?? null,
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* This should probably be split into more features as the app grows, instead of grouping messages and notifications here. */}
      <AppErrorBoundary
        boundaryName="app-shell-sidebar"
        title="Navigation is temporarily unavailable"
        message="The main content is still available. Retry the sidebar to restore search, notifications, and navigation shortcuts."
        actionHref="/"
        actionLabel="Go to feed"
        className="m-4 max-w-sm"
      >
        <LeftSidebar
          onRequireAuth={() => router.push("/login")}
          notifications={notifications}
          notificationCount={notificationCount}
          notificationLoading={notificationLoading}
          onNotificationSelect={openNotificationPanel}
        />
      </AppErrorBoundary>
      <AppErrorBoundary
        boundaryName="app-shell-content"
        title="This content area failed to render"
        message="Navigation is still available. Retry this section without reloading the whole app."
      >
        <div className="lg:pl-20">{children}</div>
      </AppErrorBoundary>
    </div>
  );
}
