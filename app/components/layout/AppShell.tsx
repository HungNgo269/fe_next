"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "./LeftSidebar";
import { useAppShellNotifications } from "../hooks/useAppShellNotifications";
import { useUser } from "@/app/share/providers/UserProvider";

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
      <LeftSidebar
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
