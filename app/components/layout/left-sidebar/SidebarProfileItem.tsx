import Link from "next/link";
import type { User } from "@/app/feature/post/types/api.types";
import Avatar from "@/app/feature/post/components/ui/Avatar";

const labelClassName = "whitespace-nowrap transition-opacity duration-200";

export default function SidebarProfileItem({
  expanded,
  pathname,
  currentUser,
  isAuthenticated,
  onSignIn,
}: {
  expanded: boolean;
  pathname: string;
  currentUser: User;
  isAuthenticated: boolean;
  onSignIn: () => void;
}) {
  if (isAuthenticated) {
    return (
      <Link
        href={`/profile/${currentUser.handle || currentUser.id}`}
        className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
          pathname.startsWith("/profile")
            ? "bg-surface-hover text-foreground"
            : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
        }`}
      >
        <span className="shrink-0">
          <Avatar
            avatar={currentUser.avatarUrl ?? undefined}
            initials={currentUser.name}
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
      {/* <span className="shrink-0">
        <Avatar />
      </span> */}
      <span
        className={`${labelClassName} ${expanded ? "opacity-100" : "opacity-0"}`}
      >
        Sign in
      </span>
    </button>
  );
}
