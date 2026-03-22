"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "./layout/LeftSidebar";
import { useAppShellSidebarData } from "./hooks/useAppShellSidebarData";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    notifications,
    notificationCount,
    notificationLoading,
    openNotificationPanel,
  } = useAppShellSidebarData();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <LeftSidebar
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onRequireAuth={() => router.push("/login")}
        notifications={notifications}
        notificationCount={notificationCount}
        notificationLoading={notificationLoading}
        onNotificationSelect={openNotificationPanel}
      />
      <div className="lg:pl-20">{children}</div>
    </div>
  );
}
