"use client";

import Link from "next/link";
import { LogOut, Moon, Sun } from "lucide-react";
import type { AvatarInfo, SidebarMessagePreview, SidebarNotificationItem } from "@/app/feature/post/types/feed";
import { navItems } from "./left-sidebar/constants";
import SidebarBrand from "./left-sidebar/SidebarBrand";
import SidebarNavItem from "./left-sidebar/SidebarNavItem";
import Avatar from "@/app/feature/post/components/ui/Avatar";
import LoginRequiredDialog from "@/app/share/components/LoginRequiredDialog";
import { useLeftSidebar } from "@/app/feature/layout/hooks/useLeftSidebar";

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
  const {
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
    toggleThemeMenu,
    badgeCounts,
    handleThemeChange,
    toggleTheme,
    handleProtectedSelect,
    handleLogout,
  } = useLeftSidebar({
    isAuthenticated,
    messageCount: messages.length,
    notificationCount: notifications.length,
  });
  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen lg:block">
        <div
          className={`flex h-screen flex-col overflow-hidden border-r border-border/70 bg-background px-2 py-3 shadow-soft transition-[width] duration-300 ease-out ${expanded ? "w-60" : "w-18"}`}
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
                isActive={item.href ? pathname === item.href : activeLabel === item.label}
                badgeCount={badgeCounts[item.key as keyof typeof badgeCounts] ?? 0}
                onSelect={handleProtectedSelect}
              />
            ))}
          </nav>

          <div className="space-y-1 border-t border-border/70 px-1 pt-2">
            {isAuthenticated ? (
              <Link
                href="/profile"
                className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${pathname === "/profile" ? "bg-surface-hover text-foreground" : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"}`}
              >
                <span className="shrink-0">
                  <span className="flex h-5 w-5 items-center justify-center">
                    <span className="scale-75">
                      <Avatar initials={currentUser.initials} colorClass={currentUser.colorClass} />
                    </span>
                  </span>
                </span>
                <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>Profile</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={onRequireAuth}
                className="group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              >
                <span className="shrink-0">
                  <span className="flex h-5 w-5 items-center justify-center">
                    <span className="scale-75">
                      <Avatar initials="SI" colorClass="avatar-slate" />
                    </span>
                  </span>
                </span>
                <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>Sign in</span>
              </button>
            )}

            <div ref={themeMenuRef} className="relative">
              <button
                type="button"
                onClick={toggleThemeMenu}
                className="group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              >
                <span className="shrink-0">
                  {themePreference === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </span>
                <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>Theme</span>
              </button>

              {showThemeMenu ? (
                <div
                  className={`absolute z-40 w-36 rounded-xl border border-border/70 bg-background p-1.5 shadow-soft ${
                    expanded ? "bottom-full left-3 mb-1.5" : "left-[4.25rem] top-1/2 -translate-y-1/2"
                  }`}
                >
                  {(["light", "dark"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleThemeChange(t)}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold transition first:mb-0 last:mt-1 ${
                        themePreference === t ? "bg-brand text-brand-foreground" : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                      {t === "light" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition text-foreground-muted hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="shrink-0">
                  <LogOut className="h-5 w-5" />
                </span>
                <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </aside>

      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <nav className="mx-auto flex h-16 w-full max-w-2xl items-center gap-1 overflow-x-auto px-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleProtectedSelect(item)}
              className={`relative flex min-w-12 flex-col items-center justify-center gap-1 rounded-lg px-2 text-xs ${
                activeLabel === item.label ? "text-foreground" : "text-foreground-muted"
              }`}
            >
              {item.icon}
              {item.badge && (badgeCounts[item.key as keyof typeof badgeCounts] ?? 0) > 0 ? (
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-like ring-2 ring-background" />
              ) : null}
            </button>
          ))}

          {isAuthenticated ? (
            <Link
              href="/profile"
              className={`flex min-w-12 flex-col items-center justify-center gap-1 rounded-lg px-2 text-xs ${
                pathname === "/profile" ? "text-foreground" : "text-foreground-muted"
              }`}
            >
              <span className="scale-90">
                <Avatar initials={currentUser.initials} colorClass={currentUser.colorClass} />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onRequireAuth}
              className="flex min-w-12 flex-col items-center justify-center gap-1 rounded-lg px-2 text-xs text-foreground-muted"
            >
              <span className="scale-90">
                <Avatar initials="SI" colorClass="avatar-slate" />
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="flex min-w-12 flex-col items-center justify-center gap-1 rounded-lg px-2 text-xs text-foreground-muted"
          >
            {themePreference === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex min-w-12 flex-col items-center justify-center gap-1 rounded-lg px-2 text-xs text-foreground-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "..." : "Out"}
            </button>
          ) : null}
        </nav>
      </aside>

      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </>
  );
}
