"use client";

import Link from "next/link";
import type { AvatarInfo } from "../../types/feed";
import Avatar from "../ui/Avatar";

type SidebarProfileItemProps = {
  expanded: boolean;
  pathname: string;
  currentUser: AvatarInfo;
  isAuthenticated: boolean;
  onSignIn: () => void;
};

const labelClassName = "whitespace-nowrap transition-opacity duration-200";

export default function SidebarProfileItem({
  expanded,
  pathname,
  currentUser,
  isAuthenticated,
  onSignIn,
}: SidebarProfileItemProps) {
  if (isAuthenticated) {
    return (
      <Link
        href="/profile"
        className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
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
          className={`${labelClassName} ${
            expanded ? "opacity-100" : "opacity-0"
          }`}
        >
          Profile
        </span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onSignIn}
      className="group relative flex w-full cursor-pointer items-center rounded-xl p-2 text-sm text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
    >
      <span className="shrink-0">
        <Avatar initials="SI" colorClass="avatar-slate" />
      </span>
      <span
        className={`${labelClassName} ${expanded ? "opacity-100" : "opacity-0"}`}
      >
        Sign in
      </span>
    </button>
  );
}
