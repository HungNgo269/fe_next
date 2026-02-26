"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { logout } from "@/app/feature/auth/api/authApi";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";
import type { NavItem } from "../left-sidebar/constants";

type UseLeftSidebarOptions = {
  isAuthenticated: boolean;
  messageCount: number;
  notificationCount: number;
};

export function useLeftSidebar({
  isAuthenticated,
  messageCount,
  notificationCount,
}: UseLeftSidebarOptions) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();

  const themePreference = useAppSessionStore((state) => state.themePreference);
  const setThemePreference = useAppSessionStore((state) => state.setThemePreference);
  const clearAuthenticatedProfile = useAppSessionStore((state) => state.clearAuthenticatedProfile);

  const [expanded, setExpanded] = useState(false);
  const [activeLabel, setActiveLabel] = useState("Search");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  const badgeCounts = {
    messages: messageCount,
    notification: notificationCount,
  };

  useEffect(() => {
    if (!showThemeMenu) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (themeMenuRef.current?.contains(target)) return;
      setShowThemeMenu(false);
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [showThemeMenu]);

  const handleThemeChange = (theme: "light" | "dark") => {
    setThemePreference(theme);
    setTheme(theme);
    setShowThemeMenu(false);
  };

  const toggleTheme = () =>
    handleThemeChange(themePreference === "light" ? "dark" : "light");

  const handleProtectedSelect = (item: NavItem) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    setActiveLabel(item.label);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logout();
    clearAuthenticatedProfile();
    router.replace("/login");
    setIsLoggingOut(false);
  };

  return {
    pathname,
    themePreference,
    themeMenuRef,
    expanded,
    setExpanded,
    activeLabel,
    isLoggingOut,
    showLoginDialog,
    setShowLoginDialog,
    showThemeMenu,
    toggleThemeMenu: () => setShowThemeMenu((prev) => !prev),
    badgeCounts,
    handleThemeChange,
    toggleTheme,
    handleProtectedSelect,
    handleLogout,
  };
}
