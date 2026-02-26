"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { User } from "../types/api.types";
import { formatRelativeTime } from "@/app/share/utils/format";
import Avatar from "./ui/Avatar";
import { IconMoreVertical } from "@/app/share/components/icons";
import { usePostMutations } from "../hooks/usePostMutations";
import { useClickOutside } from "@/app/share/hooks/useClickOutside";

export default function PostHeader({
  postId,
  author,
  time,
  audience,
}: {
  postId: string;
  author: User;
  time: string;
  audience: string;
}) {
  const { isOwner, handleStartEdit, handleDeletePost } =
    usePostMutations(postId);

  const fallback = author.email.split("@")[0] ?? "user";
  const userHandle = author.handle || fallback;
  const displayTime = formatRelativeTime(time);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(useCallback(() => setIsMenuOpen(false), []));

  const handleReport = () => {
    setIsMenuOpen(false);
    console.info("Report submitted for this post (demo).");
  };

  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar avatar={author.avatarUrl ?? undefined} gender={author.gender} />
        <div>
          <Link
            className="text-sm font-semibold text-foreground transition-opacity hover:opacity-80"
            href={`/profile/${author.handle}`}
          >
            {author.name}
            <span className="ui-text-muted ml-2 text-xs font-medium">
              @{userHandle}
            </span>
          </Link>
          <p className="ui-text-muted text-xs">
            {displayTime} - {audience}
          </p>
        </div>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          className="ui-text-muted rounded-full p-2 transition-opacity hover:opacity-70"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          type="button"
        >
          <IconMoreVertical />
        </button>
        {isMenuOpen ? (
          <div className="ui-card absolute right-0 top-10 z-20 min-w-36 rounded-xl p-2">
            {isOwner ? (
              <>
                <button
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleStartEdit();
                  }}
                  type="button"
                >
                  Edit post
                </button>
                <button
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleDeletePost();
                  }}
                  type="button"
                >
                  Delete post
                </button>
              </>
            ) : (
              <button
                className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                onClick={handleReport}
                type="button"
              >
                Report post
              </button>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
