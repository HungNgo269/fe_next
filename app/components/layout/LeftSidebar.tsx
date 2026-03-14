"use client";

import Link from "next/link";
import { LogOut, Moon, Sun } from "lucide-react";
import type {
  SidebarMessagePreview,
  SidebarNotificationItem,
} from "@/app/feature/feed/types/feed";
import type { User } from "@/app/feature/post/types/api.types";
import { mobileNavItems, navItems } from "./left-sidebar/constants";
import SidebarBrand from "./left-sidebar/SidebarBrand";
import SidebarNavItem from "./left-sidebar/SidebarNavItem";
import Avatar from "@/app/feature/post/components/ui/Avatar";
import NotificationPanel from "./left-sidebar/NotificationPanel";
import SearchPanel from "./left-sidebar/SearchPanel";
import { Sheet, SheetContent } from "@/app/share/components/ui/sheet";

import LoginRequiredDialog from "@/app/share/components/LoginRequiredDialog";
import { useLeftSidebar } from "./hooks/useLeftSidebar";

type LeftSidebarProps = {
  currentUser: User | null;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  messages: SidebarMessagePreview[];
  notifications: SidebarNotificationItem[];
  notificationCount: number;
  notificationLoading: boolean;
  onNotificationSelect: () => void;
};

export default function LeftSidebar({
  currentUser,
  isAuthenticated,
  onRequireAuth,
  messages,
  notifications,
  notificationCount,
  notificationLoading,
  onNotificationSelect,
}: LeftSidebarProps) {
  const {
    pathname,
    themePreference,
    expanded,
    setExpanded,
    activeLabel,
    isLoggingOut,
    showLoginDialog,
    setShowLoginDialog,
    showSearchPanel,
    handleSearchPanelOpenChange,
    showNotificationPanel,
    handleNotificationPanelOpenChange,
    badgeCounts,
    toggleTheme,
    handleProtectedSelect,
    handleLogout,
  } = useLeftSidebar({
    isAuthenticated,
    messageCount: messages.length,
    notificationCount,
    onNotificationSelect,
  });
  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen lg:block">
        <div
          className={`flex h-screen flex-col overflow-hidden border-r border-border/70 bg-background px-2 py-3 shadow-soft transition-[width] duration-300 ease-out ${expanded ? "w-60" : "w-18"}`}
          onMouseEnter={() => {
            if (!showNotificationPanel && !showSearchPanel) setExpanded(true);
          }}
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
                    : item.key === "search"
                      ? showSearchPanel
                      : item.key === "notification"
                        ? showNotificationPanel
                        : activeLabel === item.label
                }
                badgeCount={
                  badgeCounts[item.key as keyof typeof badgeCounts] ?? 0
                }
                onSelect={handleProtectedSelect}
              />
            ))}
          </nav>

          <div className="space-y-1  px-1 pt-2">
            {isAuthenticated ? (
              <Link
                href={`/profile/${currentUser!.handle || currentUser!.id}`}
                className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${pathname.startsWith("/profile") ? "bg-surface-hover text-foreground" : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"}`}
              >
                <span className="shrink-0">
                  <span className="flex h-5 w-5 items-center justify-center">
                    <span className="scale-75">
                      <Avatar
                        avatar={currentUser!.avatarUrl ?? undefined}
                        initials={currentUser!.name}
                      />
                    </span>
                  </span>
                </span>
                <span
                  className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}
                >
                  Profile
                </span>
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
                      <Avatar />
                    </span>
                  </span>
                </span>
                <span
                  className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}
                >
                  Sign in
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className="group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition text-foreground-muted hover:bg-surface-hover hover:text-foreground"
            >
              <span className="shrink-0">
                {themePreference === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </span>
              <span
                className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}
              >
                {themePreference === "light" ? "Dark mode" : "Light mode"}
              </span>
            </button>

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
                <span
                  className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}
                >
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </aside>

      <aside className="fixed inset-x-0 bottom-0 z-40 /70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <nav className="mx-auto flex h-14 w-full max-w-md items-center justify-around px-1.5 [&_svg]:h-4 [&_svg]:w-4">
          {mobileNavItems.map((item) => {
            const isActive = item.href
              ? pathname === item.href
              : item.key === "search"
                ? showSearchPanel
                : item.key === "notification"
                  ? showNotificationPanel
                  : activeLabel === item.label;
            const badge =
              badgeCounts[item.key as keyof typeof badgeCounts] ?? 0;

            if (item.href) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative flex min-w-10 flex-col items-center justify-center gap-0.5 rounded-md px-1.5 text-[11px] ${
                    isActive ? "text-foreground" : "text-foreground-muted"
                  }`}
                >
                  {item.icon}
                  {item.badge && badge > 0 ? (
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-like ring-2 ring-background" />
                  ) : null}
                </Link>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleProtectedSelect(item)}
                className={`relative flex min-w-10 flex-col items-center justify-center gap-0.5 rounded-md px-1.5 text-[11px] ${
                  isActive ? "text-foreground" : "text-foreground-muted"
                }`}
              >
                {item.icon}
                {item.badge && badge > 0 ? (
                  <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-like ring-2 ring-background" />
                ) : null}
              </button>
            );
          })}

          {isAuthenticated ? (
            <Link
              href={`/profile/${currentUser!.handle || currentUser!.id}`}
              className={`flex min-w-10 flex-col items-center justify-center gap-0.5 rounded-md px-1.5 text-[11px] ${
                pathname.startsWith("/profile")
                  ? "text-foreground"
                  : "text-foreground-muted"
              }`}
            >
              <span className="scale-75">
                <Avatar
                  avatar={currentUser!.avatarUrl ?? undefined}
                  initials={currentUser!.name}
                />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onRequireAuth}
              className="flex min-w-10 flex-col items-center justify-center gap-0.5 rounded-md px-1.5 text-[11px] text-foreground-muted"
            >
              <span className="scale-75">
                <Avatar />
              </span>
            </button>
          )}
        </nav>
      </aside>

      <Sheet open={showSearchPanel} onOpenChange={handleSearchPanelOpenChange}>
        <SheetContent
          side="left"
          overlayClassName="lg:left-[4.5rem]"
          closeClassName="hidden lg:inline-flex"
          className="w-[100vw] border-border/70 p-0 sm:w-[430px] lg:left-[4.5rem] lg:w-[390px]"
        >
          <SearchPanel
            open={showSearchPanel}
            onBack={() => handleSearchPanelOpenChange(false)}
            onResultSelect={() => handleSearchPanelOpenChange(false)}
          />
        </SheetContent>
      </Sheet>

      <Sheet
        open={showNotificationPanel}
        onOpenChange={handleNotificationPanelOpenChange}
      >
        <SheetContent
          side="left"
          overlayClassName="lg:left-[4.5rem]"
          closeClassName="hidden lg:inline-flex"
          className="w-[100vw] border-border/70 p-0 sm:w-[430px] lg:left-[4.5rem] lg:w-[390px]"
        >
          <NotificationPanel
            notifications={notifications}
            loading={notificationLoading}
            onBack={() => handleNotificationPanelOpenChange(false)}
          />
        </SheetContent>
      </Sheet>

      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </>
  );
}
