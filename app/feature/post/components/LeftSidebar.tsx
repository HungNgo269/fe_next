"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type {
  AvatarInfo,
  SidebarMessagePreview,
  SidebarNotificationItem,
} from "../types/feed";
import { bottomItems, navItems } from "./left-sidebar/constants";
import SidebarBrand from "./left-sidebar/SidebarBrand";
import SidebarNavItem from "./left-sidebar/SidebarNavItem";
import SidebarProfileItem from "./left-sidebar/SidebarProfileItem";
import Avatar from "./ui/Avatar";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";
import { logout } from "@/app/feature/auth/api/authApi";

type LeftSidebarProps = {
  currentUser: AvatarInfo;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  messages: SidebarMessagePreview[];
  notifications: SidebarNotificationItem[];
};

export default function LeftSidebar({
  currentUser,
  isAuthenticated,
  onRequireAuth,
  messages,
  notifications,
}: LeftSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const themePreference = useAppSessionStore((state) => state.themePreference);
  const setThemePreference = useAppSessionStore(
    (state) => state.setThemePreference,
  );
  const clearAuthenticatedProfile = useAppSessionStore(
    (state) => state.clearAuthenticatedProfile,
  );
  const [expanded, setExpanded] = useState(false);
  const [activeLabel, setActiveLabel] = useState("Trang chủ");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleThemeChange = (theme: "light" | "dark") => {
    setThemePreference(theme);
    setTheme(theme);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    await logout();
    clearAuthenticatedProfile();
    router.replace("/login");
    setIsLoggingOut(false);
  };

  const badgeCounts = {
    messages: messages.length,
    notification: notifications.length,
  };

  const homeItem = navItems.find((item) => item.key === "home");
  const reelsItem = navItems.find((item) => item.key === "reels");
  const createItem = navItems.find((item) => item.key === "create");
  const messagesItem = navItems.find((item) => item.key === "messages");

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen lg:block">
        <div
          className={`flex h-screen flex-col overflow-hidden border-r border-border/70 bg-background px-2 py-3 shadow-soft transition-[width] duration-300 ease-out ${
            expanded ? "w-60" : "w-18"
          }`}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <SidebarBrand expanded={expanded} />

          <nav className="flex-1 space-y-1 px-1">
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.key}
                item={item}
                expanded={expanded}
                isActive={
                  item.href
                    ? pathname === item.href
                    : activeLabel === item.label
                }
                badgeCount={
                  badgeCounts[item.key as keyof typeof badgeCounts] ?? 0
                }
                onSelect={setActiveLabel}
              />
            ))}

            <SidebarProfileItem
              expanded={expanded}
              pathname={pathname}
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
              onRequireAuth={onRequireAuth}
            />
          </nav>

          <div className="space-y-1 border-t border-border/70 px-1 pt-2">
            <div className="rounded-xl border border-border/70 bg-surface p-1.5">
              <p
                className={`px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest-xl text-foreground-soft transition-opacity ${
                  expanded ? "opacity-100" : "opacity-0"
                }`}
              >
                Theme
              </p>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => handleThemeChange("light")}
                  className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                    themePreference === "light"
                      ? "bg-brand text-brand-foreground"
                      : "bg-transparent text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange("dark")}
                  className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                    themePreference === "dark"
                      ? "bg-brand text-brand-foreground"
                      : "bg-transparent text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
            {bottomItems.map((item) => (
              <SidebarNavItem
                key={item.key}
                item={item}
                expanded={expanded}
                isActive={
                  item.href
                    ? pathname === item.href
                    : activeLabel === item.label
                }
                onSelect={setActiveLabel}
              />
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center justify-center rounded-xl border border-border/70 px-2 py-2 text-xs font-semibold text-foreground-muted transition hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequireAuth}
                className="flex w-full items-center justify-center rounded-xl border border-border/70 px-2 py-2 text-xs font-semibold text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </aside>

      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <nav className="mx-auto flex h-16 w-full max-w-2xl items-center justify-around px-2">
          {homeItem ? (
            <Link
              href={homeItem.href ?? "/"}
              className={`flex min-w-14 cursor-pointer flex-col items-center gap-1 text-xs ${
                pathname === "/" ? "text-foreground" : "text-foreground-muted"
              }`}
            >
              {homeItem.icon}
            </Link>
          ) : null}

          {reelsItem ? (
            <button
              type="button"
              onClick={() => setActiveLabel(reelsItem.label)}
              className={`flex min-w-14 cursor-pointer flex-col items-center gap-1 text-xs ${
                activeLabel === reelsItem.label
                  ? "text-foreground"
                  : "text-foreground-muted"
              }`}
            >
              {reelsItem.icon}
            </button>
          ) : null}

          {createItem ? (
            <button
              type="button"
              onClick={() => setActiveLabel(createItem.label)}
              className={`flex min-w-14 cursor-pointer flex-col items-center gap-1 text-xs ${
                activeLabel === createItem.label
                  ? "text-foreground"
                  : "text-foreground-muted"
              }`}
            >
              {createItem.icon}
            </button>
          ) : null}

          {messagesItem ? (
            <button
              type="button"
              onClick={() => setActiveLabel(messagesItem.label)}
              className={`relative flex min-w-14 cursor-pointer flex-col items-center gap-1 text-xs ${
                activeLabel === messagesItem.label
                  ? "text-foreground"
                  : "text-foreground-muted"
              }`}
            >
              {messagesItem.icon}
              {badgeCounts.messages > 0 ? (
                <span className="absolute right-2 top-0.5 h-2.5 w-2.5 rounded-full bg-like ring-2 ring-background" />
              ) : null}
            </button>
          ) : null}

          {isAuthenticated ? (
            <Link
              href="/profile"
              className={`flex min-w-14 cursor-pointer flex-col items-center gap-1 text-xs ${
                pathname === "/profile"
                  ? "text-foreground"
                  : "text-foreground-muted"
              }`}
            >
              <span className="scale-90">
                <Avatar
                  initials={currentUser.initials}
                  colorClass={currentUser.colorClass}
                />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onRequireAuth}
              className="flex min-w-14 cursor-pointer flex-col items-center gap-1 text-xs text-foreground-muted"
            >
              <span className="scale-90">
                <Avatar initials="SI" colorClass="avatar-slate" />
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              handleThemeChange(themePreference === "light" ? "dark" : "light")
            }
            className="flex min-w-14 cursor-pointer flex-col items-center gap-1 text-xs text-foreground-muted"
          >
            {themePreference === "light" ? "D" : "L"}
          </button>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex min-w-14 cursor-pointer flex-col items-center gap-1 text-xs text-foreground-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "..." : "Out"}
            </button>
          ) : null}
        </nav>
      </aside>
    </>
  );
}
