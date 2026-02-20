"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
  const [expanded, setExpanded] = useState(false);
  const [activeLabel, setActiveLabel] = useState("Trang chủ");

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
        </nav>
      </aside>
    </>
  );
}
