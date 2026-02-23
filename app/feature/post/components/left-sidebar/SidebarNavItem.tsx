"use client";

import Link from "next/link";
import type { NavItem } from "./constants";

type SidebarNavItemProps = {
  item: NavItem;
  expanded: boolean;
  isActive: boolean;
  badgeCount?: number;
  onSelect: (item: NavItem) => void;
};

const baseClassName =
  "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition";

export default function SidebarNavItem({
  item,
  expanded,
  isActive,
  badgeCount = 0,
  onSelect,
}: SidebarNavItemProps) {
  const className = `${baseClassName} ${
    isActive
      ? "bg-surface-hover text-foreground"
      : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
  }`;

  const content = (
    <>
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
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={className}
    >
      {content}
    </button>
  );
}
