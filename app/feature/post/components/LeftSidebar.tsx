"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type {
  AvatarInfo,
  SidebarMessagePreview,
  SidebarNotificationItem,
} from "../types/feed";
import Avatar from "./ui/Avatar";

type LeftSidebarProps = {
  currentUser: AvatarInfo;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  messages: SidebarMessagePreview[];
  notifications: SidebarNotificationItem[];
};

type NavItem = {
  key: string;
  label: string;
  href?: string;
  badge?: boolean;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    key: "home",
    label: "Trang chủ",
    href: "/",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "reels",
    label: "Reels",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    key: "messages",
    label: "Tin nhắn",
    badge: true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: "search",
    label: "Tìm kiếm",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    key: "explore",
    label: "Khám phá",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    key: "notification",
    label: "Thông báo",
    badge: true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    key: "create",
    label: "Tạo",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
];

const bottomItems: NavItem[] = [
  {
    key: "more",
    label: "Xem thêm",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
  {
    key: "meta",
    label: "Cũng của Meta",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

export default function LeftSidebar({
  currentUser,
  isAuthenticated,
  onRequireAuth,
  messages,
  notifications,
}: LeftSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState("Trang chủ");

  const renderNavButton = (item: NavItem) => {
    const isActive = item.href ? pathname === item.href : active === item.label;
    const badgeCount =
      item.key === "messages"
        ? messages.length
        : item.key === "notification"
          ? notifications.length
          : 0;

    const className = `group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
      isActive
        ? "bg-surface-hover text-foreground"
        : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
    }`;

    if (item.href) {
      return (
        <Link key={item.key} href={item.href} className={className}>
          <span className="relative shrink-0">
            {item.icon}
            {item.badge && badgeCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-like ring-2 ring-background" />
            ) : null}
          </span>
          <span
            className={`whitespace-nowrap transition-opacity duration-200 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            {item.label}
          </span>
        </Link>
      );
    }

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => setActive(item.label)}
        className={className}
      >
        <span className="relative shrink-0">
          {item.icon}
          {item.badge && badgeCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-like ring-2 ring-background" />
          ) : null}
        </span>
        <span
          className={`whitespace-nowrap transition-opacity duration-200 ${
            expanded ? "opacity-100" : "opacity-0"
          }`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen lg:block">
      <div
        className={`flex h-screen flex-col overflow-hidden border-r border-border/70 bg-background px-2 py-3 shadow-soft transition-[width] duration-300 ease-out ${
          expanded ? "w-60" : "w-[4.5rem]"
        }`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className="mb-2 flex items-center gap-3 px-3 py-2">
          <div className="h-7 w-7 shrink-0 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600" />
          <span
            className={`whitespace-nowrap text-xl font-bold tracking-tight transition-opacity duration-200 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-fuchsia-600 bg-clip-text text-transparent">
              Instagram
            </span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-1">
          {navItems.map((item) => renderNavButton(item))}

          {isAuthenticated ? (
            <Link
              href="/profile"
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                pathname === "/profile"
                  ? "bg-surface-hover text-foreground"
                  : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <span className="shrink-0">
                <Avatar
                  initials={currentUser.initials}
                  colorClass={currentUser.colorClass}
                />
              </span>
              <span
                className={`whitespace-nowrap transition-opacity duration-200 ${
                  expanded ? "opacity-100" : "opacity-0"
                }`}
              >
                Trang cá nhân
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onRequireAuth}
              className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
            >
              <span className="shrink-0">
                <Avatar initials="SI" colorClass="avatar-slate" />
              </span>
              <span
                className={`whitespace-nowrap transition-opacity duration-200 ${
                  expanded ? "opacity-100" : "opacity-0"
                }`}
              >
                Trang cá nhân
              </span>
            </button>
          )}
        </nav>

        <div className="space-y-1 border-t border-border/70 px-1 pt-2">
          {bottomItems.map((item) => renderNavButton(item))}
        </div>
      </div>
    </aside>
  );
}
