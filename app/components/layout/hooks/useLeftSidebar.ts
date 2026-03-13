"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "@/app/feature/auth/api/authApi";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";
import type { NavItem } from "../left-sidebar/constants";

type UseLeftSidebarOptions = {
  isAuthenticated: boolean;
  messageCount: number;
  notificationCount: number;
  onNotificationSelect?: () => void;
};

export function useLeftSidebar({
  isAuthenticated,
  messageCount,
  notificationCount,
  onNotificationSelect,
}: UseLeftSidebarOptions) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setTheme } = useTheme();

  const themePreference = useAppSessionStore((state) => state.themePreference);
  const setThemePreference = useAppSessionStore((state) => state.setThemePreference);
  const clearAuthenticatedProfile = useAppSessionStore((state) => state.clearAuthenticatedProfile);

  const [expanded, setExpanded] = useState(false);
  const [activeLabel, setActiveLabel] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const prevNotificationPanelOpenRef = useRef(false);

  const badgeCounts = {
    messages: messageCount,
    notification: notificationCount,
  };

  useEffect(() => {
    const wasOpen = prevNotificationPanelOpenRef.current;
    if (!wasOpen && showNotificationPanel) {
      onNotificationSelect?.();
    }
    prevNotificationPanelOpenRef.current = showNotificationPanel;
  }, [onNotificationSelect, showNotificationPanel]);

  const toggleTheme = () => {
    const nextTheme = themePreference === "light" ? "dark" : "light";
    setThemePreference(nextTheme);
    setTheme(nextTheme);
  };

  const handleSearchPanelOpenChange = (open: boolean) => {
    setShowSearchPanel(open);
    if (open) {
      setShowNotificationPanel(false);
      setExpanded(false);
      setActiveLabel("Search");
    }
  };

  const handleNotificationPanelOpenChange = (open: boolean) => {
    setShowNotificationPanel(open);
    if (open) {
      setShowSearchPanel(false);
      setExpanded(false);
      setActiveLabel("Notifications");
    }
  };

  const handleProtectedSelect = (item: NavItem) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    if (item.key === "search") {
      handleSearchPanelOpenChange(!showSearchPanel);
    } else if (item.key === "notification") {
      handleNotificationPanelOpenChange(!showNotificationPanel);
    } else {
      handleSearchPanelOpenChange(false);
      handleNotificationPanelOpenChange(false);
    }
    setActiveLabel(item.label);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logout();
    clearAuthenticatedProfile();
    queryClient.clear();
    router.replace("/login");
    setIsLoggingOut(false);
  };

  return {
    pathname,
    themePreference,
    expanded,
    setExpanded,
    activeLabel,
    isLoggingOut,
    showLoginDialog,
    setShowLoginDialog,
    showSearchPanel,
    setShowSearchPanel,
    handleSearchPanelOpenChange,
    showNotificationPanel,
    setShowNotificationPanel,
    handleNotificationPanelOpenChange,
    closeNotificationPanel: () => setShowNotificationPanel(false),
    badgeCounts,
    toggleTheme,
    handleProtectedSelect,
    handleLogout,
  };
}
